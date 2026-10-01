export type CustomerRole = 'CUSTOMER';

export interface AuthUser {
  id: number;
  role: CustomerRole;
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
