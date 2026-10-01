import type { LoginInput, LoginResult, SignupInput, SignupResult } from '@/features/auth/authTypes';

export interface AuthDataSource {
  login(input: LoginInput): Promise<LoginResult>;
  signup(input: SignupInput): Promise<SignupResult>;
}
