import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { employeeRouteBuilders } from '@/app/router/paths';
import { LoadingState } from '@/app/state';
import { isEmployeeSession, toSafeEmployeeReturnTo, useAuth } from '@/features/auth';
import { EmployeeAccessDenied } from '@/pages/employee-status/EmployeeAccessDenied';
import { Skeleton } from '@/shared/ui';

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
 * - 고객 session: redirect loop 대신 권한 안내를 보여준다.
 * - 직원 session: 하위 route를 그린다.
 */
export function EmployeeAccessBoundary() {
  const auth = useAuth();
  const location = useLocation();
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
    const state: EmployeeLoginNavigationState | null = wasEmployee
      ? { reason: 'session-expired' }
      : null;
    const returnTo = toSafeEmployeeReturnTo(`${location.pathname}${location.search}`);

    return <Navigate replace state={state} to={employeeRouteBuilders.login(returnTo)} />;
  }

  if (!isEmployee) {
    return <EmployeeAccessDenied variant="customer-session" />;
  }

  return <Outlet />;
}
