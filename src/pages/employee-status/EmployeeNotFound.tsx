import { employeeRoutePaths } from '@/app/router/paths';
import styles from '@/pages/employee-status/EmployeeStatus.module.css';
import { PageContainer, TextLink } from '@/shared/ui';

/**
 * 직원 영역 안의 없는 경로 안내다 (CP6-F §2).
 * WHY: Customer `NotFound`는 Customer chrome과 링크를 전제로 하므로 쓰지 않는다.
 */
export function EmployeeNotFound() {
  return (
    <PageContainer variant="auth">
      <section aria-labelledby="employee-not-found-heading" className={styles.card}>
        <h1 className={styles.title} id="employee-not-found-heading">
          페이지를 찾을 수 없습니다
        </h1>
        <p className={styles.text}>주소를 확인하거나 여행상품 목록에서 다시 시작해 주세요.</p>
        <div className={styles.actions}>
          <TextLink to={employeeRoutePaths.tours}>여행상품 목록으로</TextLink>
        </div>
      </section>
    </PageContainer>
  );
}
