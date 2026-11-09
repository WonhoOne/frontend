import type { AuthState, AuthUser } from '@/features/auth/authTypes';

type AuthenticatedAs<Role extends AuthUser['role']> = {
  status: 'authenticated';
  user: AuthUser & { role: Role };
};

/**
 * Customer 화면이 "로그인한 고객"을 판단하는 유일한 기준이다.
 *
 * SECURITY: EMPLOYEE session도 `status === 'authenticated'`이다. Customer 전용
 * 화면(My Trips, 이전 여행 팝업, 계정 링크)이 status만 보면 직원을 고객으로
 * 취급하게 되므로, 반드시 role까지 확인한다.
 */
export function isCustomerSession(state: AuthState): state is AuthenticatedAs<'CUSTOMER'> {
  return state.status === 'authenticated' && state.user.role === 'CUSTOMER';
}

/** Employee Console 화면이 직원 session을 판단하는 유일한 기준이다. */
export function isEmployeeSession(state: AuthState): state is AuthenticatedAs<'EMPLOYEE'> {
  return state.status === 'authenticated' && state.user.role === 'EMPLOYEE';
}
