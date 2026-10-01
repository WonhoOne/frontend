import { createContext, useContext } from 'react';

import type {
  AuthState,
  LoginInput,
  SignupInput,
  SignupResult,
} from '@/features/auth/authTypes';

export interface AuthContextValue {
  state: AuthState;
  login(input: LoginInput): Promise<void>;
  signup(input: SignupInput): Promise<SignupResult>;
  signOut(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
