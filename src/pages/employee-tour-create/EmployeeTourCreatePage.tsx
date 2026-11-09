import { useState } from 'react';
import { useNavigate } from 'react-router';

import { employeeTourDataSource } from '@/app/providers/employeeTourDataSource';
import { employeeRoutePaths } from '@/app/router/paths';
import { EmployeePageHeader } from '@/app/shell/EmployeePageHeader';
import {
  EditorActionBar,
  emptyProductFormValues,
  FormErrorSummary,
  isSameProductFormValues,
  LeaveEditorDialog,
  mapProductFieldErrors,
  orderedProductErrors,
  ProductForm,
  productFieldId,
  toEmployeeWriteOutcome,
  toTourProductWriteInput,
  useCreateEmployeeTourProduct,
  validateProductForm,
  type EmployeeWriteOutcome,
  type ProductFormErrors,
  type ProductFormValues,
} from '@/features/employee-tours';
import { EmployeeAccessDenied } from '@/pages/employee-status/EmployeeAccessDenied';
import styles from '@/pages/employee-tour-create/EmployeeTourCreatePage.module.css';
import type { EmployeeTourCreatedState } from '@/pages/employee-tours/EmployeeToursPage';
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard';
import { Button, Dialog, PageContainer } from '@/shared/ui';

const FORM_ID = 'employee-tour-create-form';

type UnknownCheck =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'found'; id: string }
  | { phase: 'not-found' }
  | { phase: 'failed' };

/**
 * 새 여행상품 (E03).
 *
 * CONTRACT: 생성은 비관적이다. 201 응답 후에만 목록으로 이동한다.
 * `POST`에는 idempotency key가 없으므로 결과를 모르면 자동으로 다시 보내지 않고,
 * 저장 여부를 확인한 뒤 사용자가 명시적으로 다시 저장하게 한다 (CP5 §3.4).
 */
export function EmployeeTourCreatePage() {
  const navigate = useNavigate();
  const create = useCreateEmployeeTourProduct(employeeTourDataSource);
  const [values, setValues] = useState<ProductFormValues>(emptyProductFormValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [summaryFocusKey, setSummaryFocusKey] = useState(0);
  const [outcome, setOutcome] = useState<EmployeeWriteOutcome | null>(null);
  const [unknownCheck, setUnknownCheck] = useState<UnknownCheck>({ phase: 'idle' });
  const [confirmResend, setConfirmResend] = useState(false);

  const isDirty = !isSameProductFormValues(values, emptyProductFormValues());
  const guard = useUnsavedChangesGuard(isDirty);

  function submit() {
    const clientErrors = validateProductForm(values);
    setErrors(clientErrors);
    setOutcome(null);
    setUnknownCheck({ phase: 'idle' });

    if (Object.keys(clientErrors).length > 0) {
      setSummaryFocusKey((key) => key + 1);
      return;
    }

    const input = toTourProductWriteInput(values);

    create.mutate(input, {
      onSuccess: (created) => {
        const state: EmployeeTourCreatedState = {
          createdTour: { id: created.id, name: created.name },
        };
        guard.allowNextNavigation();
        void navigate(employeeRoutePaths.tours, { replace: true, state });
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
    });
  }

  async function checkWhetherSaved() {
    setUnknownCheck({ phase: 'checking' });

    try {
      const list = await employeeTourDataSource.listTourProducts();
      const name = values.name.trim();
      const match = list.find((product) => product.theme === values.theme && product.name === name);
      setUnknownCheck(
        match === undefined ? { phase: 'not-found' } : { phase: 'found', id: match.id },
      );
    } catch {
      setUnknownCheck({ phase: 'failed' });
    }
  }

  if (outcome?.kind === 'forbidden') {
    return <EmployeeAccessDenied variant="forbidden" />;
  }

  const summaryItems = orderedProductErrors(errors, values.theme).map(({ field, message }) => ({
    fieldId: productFieldId(field),
    message,
  }));

  return (
    <PageContainer variant="reading">
      <EmployeePageHeader
        breadcrumb={{ label: '여행상품', to: employeeRoutePaths.tours }}
        title="새 여행상품"
      />

      <div className={styles.alerts}>
        <FormErrorSummary focusKey={summaryFocusKey} items={summaryItems} />

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

        {outcome?.kind === 'unknown' || outcome?.kind === 'not-found' ? (
          <div className={styles.alert} role="alert">
            <p>저장 결과를 확인할 수 없습니다. 이미 만들어졌을 수 있습니다.</p>
            {unknownCheck.phase === 'found' ? (
              <p>같은 테마·이름의 상품이 목록에 있습니다 (ID {unknownCheck.id}).</p>
            ) : null}
            {unknownCheck.phase === 'not-found' ? (
              <p>
                같은 테마·이름의 상품을 찾지 못했습니다. 다른 직원이 만든 상품일 수도 있으니 확인 후
                진행해 주세요.
              </p>
            ) : null}
            {unknownCheck.phase === 'failed' ? <p>목록을 확인하지 못했습니다.</p> : null}
            <div className={styles.alertActions}>
              <Button
                isLoading={unknownCheck.phase === 'checking'}
                loadingLabel="확인 중"
                onClick={() => void checkWhetherSaved()}
                size="small"
                variant="secondary"
              >
                저장 여부 확인
              </Button>
              {unknownCheck.phase === 'found' ? (
                <Button
                  onClick={() => {
                    guard.allowNextNavigation();
                    void navigate(employeeRoutePaths.tours, { replace: true });
                  }}
                  size="small"
                  variant="secondary"
                >
                  목록으로 이동
                </Button>
              ) : null}
              <Button
                disabled={unknownCheck.phase === 'idle' || unknownCheck.phase === 'checking'}
                onClick={() => setConfirmResend(true)}
                size="small"
                variant="quiet"
              >
                그래도 다시 저장
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <ProductForm
        errors={errors}
        formId={FORM_ID}
        onChange={setValues}
        onSubmit={submit}
        readOnly={create.isPending}
        values={values}
      />

      <EditorActionBar
        formId={FORM_ID}
        isSubmitting={create.isPending}
        onCancel={() => void navigate(employeeRoutePaths.tours)}
      />

      <LeaveEditorDialog
        isSaving={create.isPending}
        onLeave={guard.leave}
        onStay={guard.stay}
        open={guard.isBlocked}
      />

      <Dialog
        closeLabel="취소"
        description="이미 만들어졌다면 같은 상품이 두 번 생길 수 있습니다."
        onOpenChange={setConfirmResend}
        open={confirmResend}
        title="다시 저장할까요?"
      >
        <div className={styles.dialogActions}>
          <Button onClick={() => setConfirmResend(false)} variant="secondary">
            취소
          </Button>
          <Button
            onClick={() => {
              setConfirmResend(false);
              submit();
            }}
          >
            다시 저장
          </Button>
        </div>
      </Dialog>
    </PageContainer>
  );
}
