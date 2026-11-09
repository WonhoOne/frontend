import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { employeeTourDataSource } from '@/app/providers/employeeTourDataSource';
import { employeeRoutePaths } from '@/app/router/paths';
import { EmployeePageHeader } from '@/app/shell/EmployeePageHeader';
import { LoadingState, SectionError } from '@/app/state';
import {
  EditorActionBar,
  FormErrorSummary,
  isEmployeeReadForbidden,
  isSameProductFormValues,
  LeaveEditorDialog,
  mapProductFieldErrors,
  orderedProductErrors,
  ProductForm,
  productFieldId,
  productToFormValues,
  ThemeLabel,
  toEmployeeWriteOutcome,
  toTourProductWriteInput,
  useEmployeeTourProducts,
  useUpdateEmployeeTourProduct,
  validateProductForm,
  type EmployeeTourProduct,
  type EmployeeWriteOutcome,
  type ProductFormErrors,
  type ProductFormValues,
} from '@/features/employee-tours';
import { EmployeeAccessDenied } from '@/pages/employee-status/EmployeeAccessDenied';
import styles from '@/pages/employee-tour-edit/EmployeeTourEditPage.module.css';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import { parseBackendResourceIdentity } from '@/shared/lib/resourceIdentity';
import { Button, PageContainer, Skeleton, TextLink } from '@/shared/ui';

const FORM_ID = 'employee-tour-edit-form';
const THEME_NOTE =
  '이 상품으로 만든 여행 일정이 있으면 테마를 바꿀 수 없습니다. 이름, 설명, 가격은 바꿀 수 있습니다.';

function ProductNotFound() {
  return (
    <PageContainer variant="reading">
      <EmployeePageHeader
        breadcrumb={{ label: '여행상품', to: employeeRoutePaths.tours }}
        title="상품을 찾을 수 없습니다"
      />
      <p className={styles.text}>목록에서 다시 선택해 주세요.</p>
      <TextLink className={styles.notFoundLink ?? ''} to={employeeRoutePaths.tours}>
        여행상품 목록으로
      </TextLink>
    </PageContainer>
  );
}

function sameProduct(a: EmployeeTourProduct, b: EmployeeTourProduct) {
  return isSameProductFormValues(productToFormValues(a), productToFormValues(b));
}

/**
 * 여행상품 수정 (E04).
 *
 * CONTRACT:
 * - 값은 직원 목록 API에서 id로 고른다. 직원용 상세 API는 없다 (CP5 §1).
 * - 화면에 들어온 뒤 받은 첫 응답으로 폼을 한 번만 채운다. 이후 background refetch는
 *   입력을 덮어쓰지 않는다 (E04 §10).
 * - Backend는 일정 연결 여부(Theme 잠금)를 알려주지 않으므로 Theme 칸을 미리 잠그지
 *   않는다. 409가 오면 다른 수정은 그대로 두고 Theme만 되돌릴 수 있게 한다.
 * - PUT은 전체 교체라 결과를 모를 때 같은 본문을 다시 보내도 안전하다 (CP5 §3.2).
 */
export function EmployeeTourEditPage() {
  const { tourId } = useParams();
  const validId = parseBackendResourceIdentity(tourId) !== null ? (tourId ?? null) : null;

  if (validId === null) {
    return <ProductNotFound />;
  }

  return <EmployeeTourEditor key={validId} tourId={validId} />;
}

function EmployeeTourEditor({ tourId }: { tourId: string }) {
  const navigate = useNavigate();
  const products = useEmployeeTourProducts(employeeTourDataSource, { refetchOnMount: 'always' });
  const update = useUpdateEmployeeTourProduct(employeeTourDataSource);

  const [snapshot, setSnapshot] = useState<EmployeeTourProduct | null>(null);
  const [values, setValues] = useState<ProductFormValues | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [summaryFocusKey, setSummaryFocusKey] = useState(0);
  const [outcome, setOutcome] = useState<EmployeeWriteOutcome | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  // LIFECYCLE: React의 '이전 render 정보 저장' 패턴으로 첫 최신 응답만 폼에 넣는다.
  if (snapshot === null && !notFound && products.isFetchedAfterMount && products.data) {
    const found = products.data.find((product) => product.id === tourId);

    if (found === undefined) {
      setNotFound(true);
    } else {
      setSnapshot(found);
      setValues(productToFormValues(found));
    }
  }

  const serverProduct = products.data?.find((product) => product.id === tourId) ?? null;
  const changedElsewhere =
    snapshot !== null && serverProduct !== null && !sameProduct(snapshot, serverProduct);

  const isDirty =
    snapshot !== null &&
    values !== null &&
    !isSameProductFormValues(values, productToFormValues(snapshot));
  const guard = useUnsavedChangesGuard(isDirty);

  useEffect(() => {
    if (outcome?.kind === 'theme-locked' || outcome?.kind === 'unknown') {
      alertRef.current?.focus();
    }
  }, [outcome]);

  if (notFound || outcome?.kind === 'not-found') {
    return <ProductNotFound />;
  }

  if (
    outcome?.kind === 'forbidden' ||
    (products.error !== null && isEmployeeReadForbidden(products.error))
  ) {
    return <EmployeeAccessDenied variant="forbidden" />;
  }

  if (snapshot === null || values === null) {
    return (
      <PageContainer variant="reading">
        <EmployeePageHeader
          breadcrumb={{ label: '여행상품', to: employeeRoutePaths.tours }}
          title="여행상품 수정"
        />
        {products.isError && !products.isFetching ? (
          <SectionError
            isRetrying={products.isFetching}
            onRetry={() => void products.refetch()}
            retryLabel="다시 시도"
            retryingLabel="다시 불러오는 중"
            title="상품 정보를 불러오지 못했습니다"
          >
            <p>잠시 후 다시 시도해 주세요.</p>
          </SectionError>
        ) : (
          <LoadingState label="상품 정보를 불러오고 있습니다">
            <div className={styles.skeleton}>
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} style={{ blockSize: 72 }} />
              ))}
            </div>
          </LoadingState>
        )}
      </PageContainer>
    );
  }

  const currentValues = values;
  const currentSnapshot = snapshot;

  function submit() {
    const clientErrors = validateProductForm(currentValues);
    setErrors(clientErrors);
    setOutcome(null);
    setSavedNotice(false);

    if (Object.keys(clientErrors).length > 0) {
      setSummaryFocusKey((key) => key + 1);
      return;
    }

    const input = toTourProductWriteInput(currentValues);

    update.mutate(
      { id: tourId, input },
      {
        onSuccess: (updated) => {
          // CONTRACT: 서버가 돌려준 값이 진실이다. 폼을 응답으로 다시 채운다.
          setSnapshot(updated);
          setValues(productToFormValues(updated));
          setSavedNotice(true);
        },
        onError: (error) => {
          const next = toEmployeeWriteOutcome(error);

          if (next.kind === 'validation') {
            const submittedStyles = input.stylePrices.map(({ style }) => style);
            setErrors(mapProductFieldErrors(next.fieldErrors, submittedStyles));
            setSummaryFocusKey((key) => key + 1);
            return;
          }

          setOutcome(next);
        },
      },
    );
  }

  function revertTheme() {
    setValues({ ...currentValues, theme: currentSnapshot.theme });
    setOutcome(null);
  }

  function loadLatest() {
    if (serverProduct === null) {
      return;
    }

    setSnapshot(serverProduct);
    setValues(productToFormValues(serverProduct));
    setErrors({});
    setOutcome(null);
  }

  const summaryItems = orderedProductErrors(errors, currentValues.theme).map(
    ({ field, message }) => ({ fieldId: productFieldId(field), message }),
  );

  return (
    <PageContainer variant="reading">
      <EmployeePageHeader
        breadcrumb={{ label: '여행상품', to: employeeRoutePaths.tours }}
        meta={
          <span className={styles.meta}>
            ID {currentSnapshot.id} · <ThemeLabel theme={currentSnapshot.theme} />
          </span>
        }
        title={currentSnapshot.name}
      />

      <div className={styles.alerts}>
        <div aria-live="polite" role="status">
          {savedNotice ? <p className={styles.success}>변경 사항을 저장했습니다.</p> : null}
        </div>

        {changedElsewhere ? (
          <div className={styles.note}>
            <p>
              다른 곳에서 이 상품이 변경되었습니다.
              {isDirty ? ' 저장하면 지금 입력한 내용으로 덮어씁니다.' : ''}
            </p>
            <Button onClick={loadLatest} size="small" variant="secondary">
              최신 내용 불러오기
            </Button>
          </div>
        ) : null}

        <FormErrorSummary focusKey={summaryFocusKey} items={summaryItems} />

        {outcome?.kind === 'theme-locked' ? (
          <div className={styles.alert} ref={alertRef} role="alert" tabIndex={-1}>
            <p>
              이 상품으로 만든 여행 일정이 있어 테마를 바꿀 수 없습니다. 테마를 원래대로 되돌린 뒤
              다시 저장해 주세요.
            </p>
            <Button onClick={revertTheme} size="small" variant="secondary">
              테마 되돌리기
            </Button>
          </div>
        ) : null}

        {outcome?.kind === 'unknown' ? (
          <div className={styles.alert} ref={alertRef} role="alert" tabIndex={-1}>
            <p>저장 결과를 확인할 수 없습니다.</p>
            <Button onClick={submit} size="small" variant="secondary">
              다시 저장
            </Button>
          </div>
        ) : null}

        {outcome?.kind === 'server' ? (
          <div className={styles.alert} role="alert">
            <p>저장하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            <Button onClick={submit} size="small" variant="secondary">
              다시 저장
            </Button>
          </div>
        ) : null}

        {outcome?.kind === 'malformed' ? (
          <p className={styles.alert} role="alert">
            요청을 처리할 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.
          </p>
        ) : null}
      </div>

      <ProductForm
        errors={errors}
        formId={FORM_ID}
        onChange={(next) => {
          setValues(next);
          setSavedNotice(false);
        }}
        onSubmit={submit}
        readOnly={update.isPending}
        themeNote={THEME_NOTE}
        values={currentValues}
      />

      <EditorActionBar
        formId={FORM_ID}
        isSubmitting={update.isPending}
        onCancel={() => void navigate(employeeRoutePaths.tours)}
        submitDisabled={!isDirty}
      />

      <LeaveEditorDialog
        isSaving={update.isPending}
        onLeave={guard.leave}
        onStay={guard.stay}
        open={guard.isBlocked}
      />
    </PageContainer>
  );
}
