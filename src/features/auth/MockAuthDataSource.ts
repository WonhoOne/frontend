import type { AuthDataSource } from '@/features/auth/AuthDataSource';
import type { LoginInput, LoginResult, SignupInput, SignupResult } from '@/features/auth/authTypes';

export interface MockAuthBehavior {
  login(input: LoginInput): Promise<LoginResult>;
  signup(input: SignupInput): Promise<SignupResult>;
}

/**
 * PR-07 mock-backed adapter. Synthetic behavior is injected by the composition
 * root or tests, so this file contains no real customer records or credentials.
 */
export class MockAuthDataSource implements AuthDataSource {
  constructor(private readonly behavior: MockAuthBehavior) {}

  login(input: LoginInput) {
    return this.behavior.login(input);
  }

  signup(input: SignupInput) {
    return this.behavior.signup(input);
  }
}
