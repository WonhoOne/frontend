import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { employeeTourDataSource } from '@/app/providers/employeeTourDataSource';
import { employeeRouteBuilders, employeeRoutePaths } from '@/app/router/paths';
import { EmployeePageHeader } from '@/app/shell/EmployeePageHeader';
import { EmptyState, LoadingState, RefreshIndicator, SectionError } from '@/app/state';
import {
  isEmployeeReadForbidden,
  ProductTable,
  useEmployeeTourProducts,
} from '@/features/employee-tours';
import { EmployeeAccessDenied } from '@/pages/employee-status/EmployeeAccessDenied';
import styles from '@/pages/employee-tours/EmployeeToursPage.module.css';
import { PageContainer, Skeleton, TextLink } from '@/shared/ui';

/** 생성 화면이 목록으로 돌아올 때 넘기는 state (CP4 §3, E02 §10). */
export interface EmployeeTourCreatedState {
  createdTour: { id: string; name: string };
}

function readCreatedTour(state: unknown) {
  if (typeof state !== 'object' || state === null || !('createdTour' in state)) {
    return null;
  }

  const created = (state as Partial<EmployeeTourCreatedState>).createdTour;
  return typeof created?.id === 'string' && typeof created.name === 'string' ? created : null;
}

function CreateLink() {
  return (
    <TextLink className={styles.primaryAction ?? ''} to={employeeRoutePaths.tourCreate}>
      + 새 여행상품
    </TextLink>
  );
}

/**
 * 직원 여행상품 목록 (E02).
 *
 * CONTRACT: 목록 순서와 값은 Backend 응답 그대로다. 정렬·필터·검색을 만들지 않는다.
 * 새로고침 실패 시 이미 받은 목록은 유지한다 (Master Plan §16).
 */
export function EmployeeToursPage() {
  const location = useLocation();
  const createdTour = readCreatedTour(location.state);
  const products = useEmployeeTourProducts(employeeTourDataSource);

  useEffect(() => {
    if (createdTour === null || products.data === undefined) {
      return;
    }

    document
      .querySelector(`[data-product-id="${createdTour.id}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [createdTour, products.data]);

  if (products.error !== null && isEmployeeReadForbidden(products.error)) {
    return <EmployeeAccessDenied variant="forbidden" />;
  }

  const data = products.data;

  return (
    <PageContainer>
      <EmployeePageHeader
        actions={<CreateLink />}
        title="여행상품"
        {...(data === undefined ? {} : { count: data.length })}
      />

      <div aria-live="polite" className={styles.statusRegion} role="status">
        {createdTour === null ? null : (
          <p className={styles.status}>‘{createdTour.name}’ 여행상품을 만들었습니다.</p>
        )}
      </div>

      {data === undefined ? (
        products.isError ? (
          <SectionError
            isRetrying={products.isFetching}
            onRetry={() => void products.refetch()}
            retryLabel="다시 시도"
            retryingLabel="다시 불러오는 중"
            title="여행상품을 불러오지 못했습니다"
          >
            <p>잠시 후 다시 시도해 주세요.</p>
          </SectionError>
        ) : (
          <LoadingState label="여행상품 목록을 불러오고 있습니다">
            <div className={styles.skeleton}>
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} style={{ blockSize: 56 }} />
              ))}
            </div>
          </LoadingState>
        )
      ) : (
        <>
          {products.isRefetchError ? (
            <p className={styles.refreshError}>
              최신 정보를 불러오지 못했습니다.{' '}
              <button
                className={styles.inlineRetry}
                onClick={() => void products.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </p>
          ) : products.isFetching ? (
            <RefreshIndicator label="최신 정보를 확인하고 있습니다" state="refreshing" />
          ) : null}

          {data.length === 0 ? (
            <EmptyState action={<CreateLink />} title="아직 여행상품이 없습니다">
              <p>첫 여행상품을 만들어 테마와 스타일별 가격을 등록하세요.</p>
            </EmptyState>
          ) : (
            <ProductTable
              editHref={(id) => employeeRouteBuilders.tourEdit(id)}
              highlightedId={createdTour?.id ?? null}
              products={data}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
