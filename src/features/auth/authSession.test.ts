import { describe, expect, it, vi } from 'vitest';

import { MemoryAuthSessionStore } from '@/features/auth/authSession';

describe('MemoryAuthSessionStore', () => {
  it('keeps bearer material in memory without writing browser storage', () => {
    const storageSet = vi.spyOn(Storage.prototype, 'setItem');
    const session = new MemoryAuthSessionStore(() => 1_000);

    session.setSession({
      accessToken: 'synthetic-access-token',
      expiresAt: 61_000,
    });

    expect(session.getAccessToken()).toBe('synthetic-access-token');
    expect(session.getExpiresAt()).toBe(61_000);
    expect(storageSet).not.toHaveBeenCalled();

    storageSet.mockRestore();
  });

  it('fails closed after expiry and notifies subscribers once', () => {
    let now = 1_000;
    const listener = vi.fn();
    const session = new MemoryAuthSessionStore(() => now);
    session.subscribe(listener);
    session.setSession({
      accessToken: 'synthetic-access-token',
      expiresAt: 2_000,
    });

    now = 2_000;

    expect(session.getAccessToken()).toBeNull();
    expect(session.getExpiresAt()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('clears an active session once and makes repeated clears idempotent', () => {
    const listener = vi.fn();
    const session = new MemoryAuthSessionStore(() => 1_000);
    session.subscribe(listener);
    session.setSession({
      accessToken: 'synthetic-access-token',
      expiresAt: 61_000,
    });

    session.clear();
    session.clear();

    expect(session.getAccessToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
