import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import type { AuthDataSource } from '@/features/auth/AuthDataSource';
import { AuthContext } from '@/features/auth/authContext';
import {
  MemoryAuthSessionStore,
  type AuthSessionStore,
} from '@/features/auth/authSession';
import {
  AuthError,
  type AuthState,
  type LoginInput,
  type SignupInput,
  type SignupResult,
} from '@/features/auth/authTypes';

interface AuthProviderProps extends PropsWithChildren {
  dataSource: AuthDataSource;
  onAuthLoss?: () => void;
  now?: () => number;
  sessionStore?: AuthSessionStore;
}

const UNAUTHENTICATED: AuthState = { status: 'unauthenticated' };

/**
 * Owns the v0.2 browser auth lifecycle.
 *
 * SECURITY: bearer material lives in an AuthSessionStore that is document-memory
 * only. The public React context exposes user/auth state but never the token.
 */
export function AuthProvider({
  children,
  dataSource,
  onAuthLoss,
  now = Date.now,
  sessionStore,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: 'checking' });
  const ownedSessionStoreRef = useRef<AuthSessionStore | null>(null);
  const wasAuthenticatedRef = useRef(false);

  if (ownedSessionStoreRef.current === null) {
    ownedSessionStoreRef.current = new MemoryAuthSessionStore(now);
  }

  const activeSessionStore = sessionStore ?? ownedSessionStoreRef.current;

  const becomeUnauthenticated = useCallback(() => {
    activeSessionStore.clear();
    setState(UNAUTHENTICATED);
  }, [activeSessionStore]);

  useEffect(
    () =>
      activeSessionStore.subscribe(() => {
        setState(UNAUTHENTICATED);
      }),
    [activeSessionStore],
  );

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
    if (state.status !== 'authenticated') {
      return;
    }

    const expiresAt = activeSessionStore.getExpiresAt();

    if (expiresAt === null) {
      becomeUnauthenticated();
      return;
    }

    const remainingMs = expiresAt - now();

    if (remainingMs <= 0) {
      becomeUnauthenticated();
      return;
    }

    const timeoutId = window.setTimeout(becomeUnauthenticated, remainingMs);
    return () => window.clearTimeout(timeoutId);
  }, [activeSessionStore, becomeUnauthenticated, now, state.status]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await dataSource.login(input);

      activeSessionStore.setSession({
        accessToken: result.accessToken,
        expiresAt: now() + result.expiresIn * 1000,
      });
      setState({
        status: 'authenticated',
        user: result.user,
      });
    },
    [activeSessionStore, dataSource, now],
  );

  const signup = useCallback(
    (input: SignupInput): Promise<SignupResult> => dataSource.signup(input),
    [dataSource],
  );

  const invalidateSession = useCallback(
    (error: unknown) => {
      if (
        state.status !== 'authenticated' ||
        !(error instanceof AuthError) ||
        !(
          error.code === 'AUTHENTICATION_REQUIRED' ||
          error.code === 'INVALID_ACCESS_TOKEN' ||
          error.code === 'ACCESS_TOKEN_EXPIRED'
        )
      ) {
        return false;
      }

      becomeUnauthenticated();
      return true;
    },
    [becomeUnauthenticated, state.status],
  );

  const signOut = useCallback(() => {
    becomeUnauthenticated();
  }, [becomeUnauthenticated]);

  const value = useMemo(
    () => ({ state, login, signup, invalidateSession, signOut }),
    [invalidateSession, login, signOut, signup, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
