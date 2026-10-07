import { afterEach, describe, expect, it, vi } from 'vitest';

import { backendHttpClient } from '@/app/providers/backendHttpClient';
import { authSessionStore } from '@/app/providers/authSession';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  authSessionStore.clear();
  vi.unstubAllGlobals();
});

describe('central BackendHttpClient auth composition', () => {
  it('reads the shared memory token for private requests only', async () => {
    const fetchImplementation = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => jsonResponse({ ok: true }),
    );
    vi.stubGlobal('fetch', fetchImplementation);
    authSessionStore.setSession({
      accessToken: 'central-memory-token',
      expiresAt: Date.now() + 60_000,
    });

    await backendHttpClient.requestJson({
      path: '/private-contract-test',
      authentication: 'required',
    });
    await backendHttpClient.requestJson({
      path: '/public-contract-test',
    });

    const privateInit = fetchImplementation.mock.calls[0]?.[1];
    const publicInit = fetchImplementation.mock.calls[1]?.[1];

    expect(privateInit).toBeDefined();
    expect(publicInit).toBeDefined();
    expect(new Headers(privateInit?.headers).get('authorization')).toBe(
      'Bearer central-memory-token',
    );
    expect(new Headers(publicInit?.headers).get('authorization')).toBeNull();
  });

  it('clears the shared session after a private 401 but not after a private 403', async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            code: 'INVALID_ACCESS_TOKEN',
            message: 'Synthetic invalid token.',
            fieldErrors: [],
          },
          401,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            code: 'FORBIDDEN',
            message: 'Synthetic forbidden.',
            fieldErrors: [],
          },
          403,
        ),
      );
    vi.stubGlobal('fetch', fetchImplementation);
    authSessionStore.setSession({
      accessToken: 'first-token',
      expiresAt: Date.now() + 60_000,
    });

    await expect(
      backendHttpClient.requestJson({
        path: '/private-unauthorized',
        authentication: 'required',
      }),
    ).rejects.toMatchObject({ response: { status: 401 } });
    expect(authSessionStore.getAccessToken()).toBeNull();

    authSessionStore.setSession({
      accessToken: 'second-token',
      expiresAt: Date.now() + 60_000,
    });

    await expect(
      backendHttpClient.requestJson({
        path: '/private-forbidden',
        authentication: 'required',
      }),
    ).rejects.toMatchObject({ response: { status: 403 } });
    expect(authSessionStore.getAccessToken()).toBe('second-token');
  });
});
