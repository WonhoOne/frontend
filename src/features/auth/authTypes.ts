export type CustomerRole = 'CUSTOMER';

/**
 * CONTRACT: REST v0.2 login은 CUSTOMER와 EMPLOYEE를 같은 endpoint로 인증한다.
 * 어느 화면이 어떤 role을 받아들이는지는 login 호출자가 `expectedRole`로 정한다.
 */
export type UserRole = 'CUSTOMER' | 'EMPLOYEE';

export interface AuthUser {
  id: number;
  role: UserRole;
  name: string;
}

export type AuthState =
  | { status: 'checking' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' };

export interface LoginInput {
  loginId: string;
  password: string;
}

export interface LoginOptions {
  /**
   * SECURITY: 이 화면이 받아들이는 role이다. 다른 role로 인증되면 session을
   * 저장하지 않고 `FORBIDDEN`으로 거부한다. Customer 화면에 EMPLOYEE session이,
   * Employee 화면에 CUSTOMER session이 섞이지 않게 하는 단일 지점이다.
   */
  expectedRole: UserRole;
}

export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
}

export interface SignupInput {
  loginId: string;
  password: string;
  name: string;
  address: string;
  contact: string;
}

export interface SignupResult {
  id: number;
  role: CustomerRole;
  name: string;
}

export type AuthErrorCode =
  | 'LOGIN_FAILED'
  | 'AUTHENTICATION_REQUIRED'
  | 'INVALID_ACCESS_TOKEN'
  | 'ACCESS_TOKEN_EXPIRED'
  | 'FORBIDDEN'
  | 'LOGIN_ID_ALREADY_EXISTS'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN';

export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message = code,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
