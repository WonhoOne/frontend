import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import type { AuthDataSource } from '@/features/auth/AuthDataSource';
import { AuthContext } from '@/features/auth/authContext';
import type { AuthState, LoginInput, SignupInput, SignupResult } from '@/features/auth/authTypes';

interface ActiveSession {
  accessToken: string;
  expiresAt: number;
}

interface AuthProviderProps extends PropsWithChildren {
  dataSource: AuthDataSource;
  onAuthLoss?: () => void;
  now?: () => number;
}

const UNAUTHENTICATED: AuthState = { status: 'unauthenticated' };

/**
 * Owns the v0.2 browser auth lifecycle.
 *
 * SECURITY: bearer material intentionally lives only in this mounted provider's
 * memory. It is never mirrored to Web Storage, Query cache, URL state, or UI
 * context. A document reload therefore starts unauthenticated.
 */
export function AuthProvider({
  children,
  dataSource,
  onAuthLoss,
  now = Date.now,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: 'checking' });
  const sessionRef = useRef<ActiveSession | null>(null);
  const wasAuthenticatedRef = useRef(false);

  const becomeUnauthenticated = useCallback(() => {
    sessionRef.current = null;
    setState(UNAUTHENTICATED);
  }, []);

  useEffect(() => {
    // E01 has no persistent bootstrap. Keep the explicit checking phase while
    // completing bootstrap asynchronously instead of cascading state in an effect.
    const bootstrapId = window.setTimeout(() => setState(UNAUTHENTICATED), 0);
    return () => window.clearTimeout(bootstrapId);
  }, []);

  useEffect(() => {
    const authenticated = state.status === 'authenticated';

    if (wasAuthenticatedRef.current && !authenticated) {
      // SECURITY: private server state must not outlive the authenticated session.
      onAuthLoss?.();
    }

    wasAuthenticatedRef.current = authenticated;
  }, [onAuthLoss, state.status]);

  useEffect(() => {
    if (state.status !== 'authenticated' || !sessionRef.current) {
      return;
    }

    const remainingMs = sessionRef.current.expiresAt - now();

    if (remainingMs <= 0) {
      becomeUnauthenticated();
      return;
    }

    const timeoutId = window.setTimeout(becomeUnauthenticated, remainingMs);
    return () => window.clearTimeout(timeoutId);
  }, [becomeUnauthenticated, now, state.status]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await dataSource.login(input);

      sessionRef.current = {
        accessToken: result.accessToken,
        expiresAt: now() + result.expiresIn * 1000,
      };
      setState({
        status: 'authenticated',
        user: result.user,
      });
    },
    [dataSource, now],
  );

  const signup = useCallback(
    (input: SignupInput): Promise<SignupResult> => dataSource.signup(input),
    [dataSource],
  );

  const signOut = useCallback(() => {
    becomeUnauthenticated();
  }, [becomeUnauthenticated]);

  const value = useMemo(() => ({ state, login, signup, signOut }), [login, signOut, signup, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
