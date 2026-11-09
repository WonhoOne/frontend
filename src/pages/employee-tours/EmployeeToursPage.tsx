import { PageContainer } from '@/shared/ui';

/**
 * 직원 여행상품 목록 (E02).
 *
 * LIFECYCLE: E-PR1에서는 접근 경계와 shell 검증용으로 heading만 둔다.
 * E-PR2가 목록·빈 상태·오류 상태를 포함한 실제 화면으로 교체한다.
 */
export function EmployeeToursPage() {
  return (
    <PageContainer>
      <h1>여행상품</h1>
    </PageContainer>
  );
}
