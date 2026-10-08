import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  AuthError,
  BackendAuthDataSource,
  MockAuthDataSource,
  type AuthDataSource,
} from '@/features/auth';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';

export interface AuthCompositionEnvironment {
  DEV: boolean;
  VITE_ENABLE_MOCKS?: string;
}

export interface AuthDataSourceCompositionOptions {
  client?: Pick<BackendHttpClient, 'requestJson'>;
  environment?: AuthCompositionEnvironment;
}

function createDevelopmentMockAuthDataSource(): AuthDataSource {
  return new MockAuthDataSource({
    login() {
      return Promise.reject(new AuthError('LOGIN_FAILED'));
    },
    signup() {
      return Promise.reject(new AuthError('UNKNOWN'));
    },
  });
}

/**
 * Auth composition policy.
 *
 * PRODUCTION: always real Backend.
 * DEVELOPMENT: real Backend by default; mock only with explicit VITE_ENABLE_MOCKS=true.
 * There is no network-error fallback from BackendAuthDataSource to MockAuthDataSource.
 */
export function createAuthDataSource(
  options: AuthDataSourceCompositionOptions = {},
): AuthDataSource {
  const environment = options.environment ?? import.meta.env;
  const client = options.client ?? backendHttpClient;

  if (environment.DEV && environment.VITE_ENABLE_MOCKS === 'true') {
    return createDevelopmentMockAuthDataSource();
  }

  return new BackendAuthDataSource(client);
}

export const authDataSource = import.meta.env.PROD
  ? new BackendAuthDataSource(backendHttpClient)
  : createAuthDataSource();
