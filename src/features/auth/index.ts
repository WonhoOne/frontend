export type { AuthDataSource } from './AuthDataSource';
export { AuthProvider } from './AuthProvider';
export { MockAuthDataSource } from './MockAuthDataSource';
export { useAuth } from './authContext';
export type { AuthContextValue } from './authContext';
export { AuthError } from './authTypes';
export type {
  AuthErrorCode,
  AuthState,
  AuthUser,
  CustomerRole,
  LoginInput,
  LoginResult,
  SignupInput,
  SignupResult,
} from './authTypes';

export {
  clearReturnContext,
  consumeReturnContext,
  isSafeInternalReturnTo,
  parseReturnContext,
  resolveReturnContextSessionStorage,
  saveReturnContext,
  RETURN_CONTEXT_MAX_AGE_MS,
  RETURN_CONTEXT_SCHEMA_VERSION,
  RETURN_CONTEXT_STORAGE_KEY,
  type ReturnContextStorage,
  type ReturnContextV1,
  type ReturnIntent,
} from '@/features/auth/returnContext';
