import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  EmployeeTourProduct,
  TourProductWriteInput,
} from '@/features/employee-tours/employeeTour.model';
import type { EmployeeTourDataSource } from '@/features/employee-tours/EmployeeTourDataSource';
import { shouldRetryEmployeeRead } from '@/features/employee-tours/employeeTourErrors';

/**
 * 직원 여행상품 목록 cache key.
 * SECURITY: `'employee'`로 시작해 공개 `['public','tour-products']`와 섞이지 않는다.
 */
export const employeeTourProductsQueryKey = ['employee', 'tour-products'] as const;

interface EmployeeTourProductsOptions {
  /** 편집 화면은 항상 최신 값으로 시작한다 (CP5 §1). */
  refetchOnMount?: 'always';
}

/**
 * CONTRACT (CP5 §1–§2): private, staleTime 0, polling 없음, 네트워크/5xx만 1회 재시도.
 * 로그아웃·401 때 `meta.privacy = 'private'` cache는 AuthProvider가 비운다.
 */
export function useEmployeeTourProducts(
  dataSource: EmployeeTourDataSource,
  options: EmployeeTourProductsOptions = {},
) {
  return useQuery({
    queryKey: employeeTourProductsQueryKey,
    queryFn: ({ signal }) => dataSource.listTourProducts(signal),
    staleTime: 0,
    meta: { privacy: 'private' },
    retry: shouldRetryEmployeeRead,
    ...(options.refetchOnMount === undefined ? {} : { refetchOnMount: options.refetchOnMount }),
  });
}

/** 생성은 비관적이다: 서버 응답 후에만 성공을 보여주고 자동 재시도하지 않는다. */
export function useCreateEmployeeTourProduct(dataSource: EmployeeTourDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TourProductWriteInput) => dataSource.createTourProduct(input),
    retry: 0,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeTourProductsQueryKey }),
  });
}

/** PUT은 전체 교체라 같은 본문을 다시 보내도 안전하다 (CP5 §3.2). */
export function useUpdateEmployeeTourProduct(dataSource: EmployeeTourDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TourProductWriteInput }) =>
      dataSource.updateTourProduct(id, input),
    retry: 0,
    onSuccess: (updated: EmployeeTourProduct) => {
      queryClient.setQueryData<readonly EmployeeTourProduct[]>(
        employeeTourProductsQueryKey,
        (current) => current?.map((product) => (product.id === updated.id ? updated : product)),
      );
      return queryClient.invalidateQueries({ queryKey: employeeTourProductsQueryKey });
    },
  });
}
