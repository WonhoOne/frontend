// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import {
  clearReturnContext,
  consumeReturnContext,
  isSafeInternalReturnTo,
  parseReturnContext,
  saveReturnContext,
  RETURN_CONTEXT_MAX_AGE_MS,
  RETURN_CONTEXT_SCHEMA_VERSION,
  RETURN_CONTEXT_STORAGE_KEY,
  type ReturnContextStorage,
} from '@/features/auth';
import { RESERVATION_DRAFT_SCHEMA_VERSION } from '@/features/reservation';

const NOW = 1_800_000_000_000;

function context(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: RETURN_CONTEXT_SCHEMA_VERSION,
    returnTo: '/reservation/review?from=auth#summary',
    intent: 'resume-reservation-review',
    draftSchemaVersion: RESERVATION_DRAFT_SCHEMA_VERSION,
    createdAt: NOW,
    ...overrides,
  };
}

afterEach(() => {
  clearReturnContext(null);
  window.sessionStorage.clear();
});

describe('ReturnContext security boundary', () => {
  it.each([
    '/',
    '/my-trips',
    '/reservation/review?from=auth#summary',
    '/tours/demo/configure',
  ])('accepts app-owned internal return path %s', (returnTo) => {
    expect(isSafeInternalReturnTo(returnTo)).toBe(true);
  });

  it.each([
    'https://evil.example/path',
    'http://evil.example',
    '//evil.example/path',
    'javascript:alert(1)',
    'data:text/html,test',
    'reservation/review',
    '',
  ])('rejects external, executable, protocol-relative, or non-root return target %s', (returnTo) => {
    expect(isSafeInternalReturnTo(returnTo)).toBe(false);
  });

  it('rejects malformed schema, unsupported intent, incompatible draft version, stale and future data', () => {
    expect(parseReturnContext(context({ schemaVersion: 2 }), NOW)).toBeNull();
    expect(parseReturnContext(context({ intent: 'auto-submit' }), NOW)).toBeNull();
    expect(
      parseReturnContext(
        context({ draftSchemaVersion: RESERVATION_DRAFT_SCHEMA_VERSION + 1 }),
        NOW,
      ),
    ).toBeNull();
    expect(
      parseReturnContext(context({ createdAt: NOW - RETURN_CONTEXT_MAX_AGE_MS - 1 }), NOW),
    ).toBeNull();
    expect(parseReturnContext(context({ createdAt: NOW + 1 }), NOW)).toBeNull();
  });

  it('persists only the approved five-field navigation schema', () => {
    expect(
      saveReturnContext(
        {
          returnTo: '/my-trips',
          intent: 'continue-navigation',
          createdAt: NOW,
        },
        window.sessionStorage,
        NOW,
      ),
    ).toBe(true);

    const serialized = window.sessionStorage.getItem(RETURN_CONTEXT_STORAGE_KEY);
    expect(serialized).not.toBeNull();

    const stored = JSON.parse(serialized ?? '{}') as Record<string, unknown>;
    expect(Object.keys(stored).sort()).toEqual(
      ['createdAt', 'draftSchemaVersion', 'intent', 'returnTo', 'schemaVersion'].sort(),
    );
    expect(JSON.stringify(stored)).not.toMatch(/password|token|contact|address|accessToken/i);
  });

  it('recovers once from sessionStorage after memory is cleared to model document reload', () => {
    saveReturnContext(
      {
        returnTo: '/reservation/review',
        intent: 'resume-reservation-review',
        createdAt: NOW,
      },
      window.sessionStorage,
      NOW,
    );

    clearReturnContext(null);

    expect(consumeReturnContext(window.sessionStorage, NOW)).toEqual(
      context({ returnTo: '/reservation/review' }),
    );
    expect(window.sessionStorage.getItem(RETURN_CONTEXT_STORAGE_KEY)).toBeNull();
    expect(consumeReturnContext(window.sessionStorage, NOW)).toBeNull();
  });

  it('discards corrupt or unsafe persisted data and removes it from storage', () => {
    window.sessionStorage.setItem(RETURN_CONTEXT_STORAGE_KEY, '{broken');
    expect(consumeReturnContext(window.sessionStorage, NOW)).toBeNull();
    expect(window.sessionStorage.getItem(RETURN_CONTEXT_STORAGE_KEY)).toBeNull();

    window.sessionStorage.setItem(
      RETURN_CONTEXT_STORAGE_KEY,
      JSON.stringify(context({ returnTo: 'https://evil.example' })),
    );
    expect(consumeReturnContext(window.sessionStorage, NOW)).toBeNull();
    expect(window.sessionStorage.getItem(RETURN_CONTEXT_STORAGE_KEY)).toBeNull();
  });

  it('degrades to memory-only when sessionStorage throws', () => {
    const throwingStorage: ReturnContextStorage = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      },
    };

    expect(
      saveReturnContext(
        {
          returnTo: '/my-trips',
          intent: 'continue-navigation',
          createdAt: NOW,
        },
        throwingStorage,
        NOW,
      ),
    ).toBe(true);

    expect(consumeReturnContext(throwingStorage, NOW)).toEqual(
      context({
        returnTo: '/my-trips',
        intent: 'continue-navigation',
      }),
    );
  });

  it('refuses to save an unsafe target and leaves no persisted context', () => {
    expect(
      saveReturnContext(
        {
          returnTo: '//evil.example',
          intent: 'continue-navigation',
          createdAt: NOW,
        },
        window.sessionStorage,
        NOW,
      ),
    ).toBe(false);
    expect(window.sessionStorage.getItem(RETURN_CONTEXT_STORAGE_KEY)).toBeNull();
  });
});
