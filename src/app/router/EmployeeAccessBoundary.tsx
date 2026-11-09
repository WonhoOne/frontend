import { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';

import { employeeRouteBuilders } from '@/app/router/paths';
import { LoadingState } from '@/app/state';
import { isEmployeeSession, toSafeEmployeeReturnTo, useAuth } from '@/features/auth';
import { EmployeeAccessDenied } from '@/pages/employee-status/EmployeeAccessDenied';
import { Button, Skeleton } from '@/shared/ui';

import styles from '@/app/router/EmployeeAccessBoundary.module.css';

/** 로그인 화면에 왜 왔는지 알려주는 navigation state다. */
export interface EmployeeLoginNavigationState {
  reason: 'session-expired';
}

/**
 * 직원 전용 route의 진입 조건을 한곳에서 판단한다 (E01 §2, CP6-F §4).
 *
 * SECURITY: 이 판단은 화면 이동용이다. 실제 권한은 Backend가
 * `/api/v1/employee/**`에서 EMPLOYEE role로 검사한다.
 *
 * - 비로그인: 현재 경로를 검증된 returnTo로 붙여 직원 로그인으로 보낸다.
 * - 직원으로 있다가 session이 사라짐(401, 만료): 화면을 유지한 채 다시 로그인 안내.
 * - 고객 session: redirect loop 대신 권한 안내를 보여준다.
 * - 직원 session: 하위 route를 그린다.
 */
export function EmployeeAccessBoundary() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [wasEmployee, setWasEmployee] = useState(false);
  const isEmployee = isEmployeeSession(auth.state);

  // LIFECYCLE: React의 '이전 render 정보 저장' 패턴. 직원 session을 한 번이라도
  // 봤는지 기억해 두었다가, 이후 비로그인이 되면 만료 안내를 붙인다.
  if (isEmployee && !wasEmployee) {
    setWasEmployee(true);
  }

  if (auth.state.status === 'checking') {
    return (
      <LoadingState label="직원 로그인 상태를 확인하고 있습니다">
        <Skeleton style={{ blockSize: 48, inlineSize: '40%' }} />
      </LoadingState>
    );
  }

  if (auth.state.status === 'unauthenticated') {
    const returnTo = toSafeEmployeeReturnTo(`${location.pathname}${location.search}`);
    const loginPath = employeeRouteBuilders.login(returnTo);

    if (!wasEmployee) {
      return <Navigate replace to={loginPath} />;
    }

    // SAFETY (CP6-G G2): 일하던 중 session이 사라졌다. 화면과 입력은 그대로 두고
    // 다시 로그인할 길만 알린다. 이동은 사용자가 고르며, 저장하지 않은 입력이 있으면
    // 편집 화면의 unsaved-changes guard가 한 번 더 확인한다.
    const state: EmployeeLoginNavigationState = { reason: 'session-expired' };

    return (
      <>
        <div className={styles.expired} role="alert">
          <p>
            세션이 만료되었습니다. 다시 로그인하면 이 화면으로 돌아옵니다. 저장하지 않은 입력은
            유지되지 않으니 필요하면 먼저 복사해 두세요.
          </p>
          <Button onClick={() => void navigate(loginPath, { replace: true, state })} size="small">
            다시 로그인
          </Button>
        </div>
        <Outlet />
      </>
    );
  }

  if (!isEmployee) {
    return <EmployeeAccessDenied variant="customer-session" />;
  }

  return <Outlet />;
}
