import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import type { AuthDataSource } from '@/features/auth/AuthDataSource';
import { AuthContext } from '@/features/auth/authContext';
import { MemoryAuthSessionStore, type AuthSessionStore } from '@/features/auth/authSession';
import {
  AuthError,
  type AuthState,
  type LoginInput,
  type LoginOptions,
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
  const [ownedSessionStore] = useState<AuthSessionStore>(() => new MemoryAuthSessionStore(now));
  const wasAuthenticatedRef = useRef(false);
  const activeSessionStore = sessionStore ?? ownedSessionStore;

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
    // LIFECYCLE: 아직 'checking'일 때만 비로그인으로 확정한다. 그 사이 로그인이 끝났다면
    // 새 session을 덮어쓰지 않는다.
    const bootstrapId = window.setTimeout(
      () => setState((current) => (current.status === 'checking' ? UNAUTHENTICATED : current)),
      0,
    );
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
      return;
    }

    const remainingMs = Math.max(0, expiresAt - now());
    const timeoutId = window.setTimeout(becomeUnauthenticated, remainingMs);
    return () => window.clearTimeout(timeoutId);
  }, [activeSessionStore, becomeUnauthenticated, now, state.status]);

  const login = useCallback(
    async (input: LoginInput, options: LoginOptions) => {
      const result = await dataSource.login(input);

      // SECURITY: 기대하지 않은 role이면 token을 어디에도 저장하지 않는다.
      // 기존 session(있다면)은 그대로 둔다.
      if (result.user.role !== options.expectedRole) {
        throw new AuthError('FORBIDDEN');
      }

      // SECURITY: 로그인된 상태에서 다른 사용자/role로 다시 로그인하면 상태가
      // authenticated → authenticated로 바뀌어 아래 auth-loss effect가 실행되지 않는다.
      // 이전 사용자의 private server state가 남지 않도록 여기서 직접 비운다.
      if (
        state.status === 'authenticated' &&
        (state.user.id !== result.user.id || state.user.role !== result.user.role)
      ) {
        onAuthLoss?.();
      }

      activeSessionStore.setSession({
        accessToken: result.accessToken,
        expiresAt: now() + result.expiresIn * 1000,
      });
      setState({
        status: 'authenticated',
        user: result.user,
      });
    },
    [activeSessionStore, dataSource, now, onAuthLoss, state],
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
