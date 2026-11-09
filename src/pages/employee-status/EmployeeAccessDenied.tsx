import { useNavigate } from 'react-router';

import { employeeRoutePaths, routePaths } from '@/app/router/paths';
import type { EmployeeSignOutNavigationState } from '@/app/shell/EmployeeShell';
import styles from '@/pages/employee-status/EmployeeStatus.module.css';
import { Button, PageContainer, TextLink } from '@/shared/ui';

interface EmployeeAccessDeniedProps {
  /**
   * - `customer-session`: 고객 계정으로 로그인된 채 직원 화면에 온 경우
   * - `forbidden`: 직원 session이지만 Backend가 403을 준 경우
   */
  variant: 'customer-session' | 'forbidden';
}

/**
 * 직원 화면 권한 안내다 (E01 §14).
 *
 * WHY: 403이나 잘못된 role을 로그인 화면으로 계속 돌려보내면 무한 반복이 된다.
 * 이유를 보여주고 사용자가 고를 수 있는 다음 행동만 제시한다.
 */
export function EmployeeAccessDenied({ variant }: EmployeeAccessDeniedProps) {
  const navigate = useNavigate();

  const description =
    variant === 'customer-session'
      ? '현재 고객 계정으로 로그인되어 있습니다.'
      : '이 작업을 할 권한이 없습니다.';

  return (
    <PageContainer variant="auth">
      <section aria-labelledby="employee-access-denied-heading" className={styles.card}>
        <h1 className={styles.title} id="employee-access-denied-heading">
          직원 전용 화면입니다
        </h1>
        <p className={styles.text}>{description}</p>
        <div className={styles.actions}>
          <Button
            onClick={() => {
              // SECURITY: 다른 계정으로 바꾸기 전에 현재 session과 private cache를 비운다.
              // shell 로그아웃과 같은 경로를 써서, 접근 경계가 이를 세션 만료로 오인하지 않게 한다.
              const signOutState: EmployeeSignOutNavigationState = { employeeSignOut: true };
              void navigate(employeeRoutePaths.login, { replace: true, state: signOutState });
            }}
          >
            직원 계정으로 다시 로그인
          </Button>
          {variant === 'customer-session' ? (
            <TextLink to={routePaths.home}>고객 홈으로</TextLink>
          ) : null}
        </div>
      </section>
    </PageContainer>
  );
}
