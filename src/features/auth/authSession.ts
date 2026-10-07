export interface ActiveAuthSession {
  accessToken: string;
  expiresAt: number;
}

export interface AuthSessionStore {
  setSession(session: ActiveAuthSession): void;
  getAccessToken(): string | null;
  getExpiresAt(): number | null;
  clear(): void;
  subscribe(listener: () => void): () => void;
}

/**
 * Document-memory-only bearer session.
 *
 * SECURITY:
 * - no Web Storage, cookies, URL state, or Query cache
 * - the access token has one mutable owner for the current document
 * - reads fail closed after expiry and notify subscribers exactly once
 */
export class MemoryAuthSessionStore implements AuthSessionStore {
  private session: ActiveAuthSession | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly now: () => number = Date.now) {}

  setSession(session: ActiveAuthSession) {
    this.session = {
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
    };
  }

  getAccessToken() {
    return this.getActiveSession()?.accessToken ?? null;
  }

  getExpiresAt() {
    return this.getActiveSession()?.expiresAt ?? null;
  }

  clear() {
    if (this.session === null) {
      return;
    }

    this.session = null;

    for (const listener of this.listeners) {
      listener();
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private getActiveSession() {
    if (this.session !== null && this.session.expiresAt <= this.now()) {
      this.clear();
    }

    return this.session;
  }
}
