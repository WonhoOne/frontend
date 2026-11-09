import { PageContainer } from '@/shared/ui';

/**
 * 직원 재고 관리 (E05).
 *
 * LIFECYCLE: E-PR1에서는 접근 경계와 shell 검증용으로 heading만 둔다.
 * E-PR4가 재고 표와 재고 추가 dialog로 교체한다.
 */
export function EmployeeInventoryPage() {
  return (
    <PageContainer>
      <h1>재고 관리</h1>
    </PageContainer>
  );
}
