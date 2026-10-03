import { http, HttpResponse, delay } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';
import { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import {
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';

const baseUrl = 'https://backend.example.test/api/v1';
const client = new BackendHttpClient({ baseUrl });

describe('BackendHttpClient', () => {
  it('returns response metadata and unknown JSON for a successful request', async () => {
    server.use(
      http.get(`${baseUrl}/tours`, () =>
        HttpResponse.json([{ id: 1 }], {
          headers: { 'x-contract-test': 'tour-list' },
        }),
      ),
    );

    await expect(client.requestJson({ path: '/tours' })).resolves.toMatchObject({
      status: 200,
      body: [{ id: 1 }],
      headers: { 'x-contract-test': 'tour-list' },
    });
  });

  it('serializes JSON requests without inventing authorization headers', async () => {
    server.use(
      http.post(`${baseUrl}/echo`, async ({ request }) => {
        expect(request.headers.get('accept')).toBe('application/json');
        expect(request.headers.get('content-type')).toBe('application/json');
        expect(request.headers.get('authorization')).toBeNull();
        expect(await request.json()).toEqual({ value: 7 });

        return HttpResponse.json({ accepted: true });
      }),
    );

    await expect(
      client.requestJson({ path: '/echo', method: 'POST', body: { value: 7 } }),
    ).resolves.toMatchObject({ body: { accepted: true } });
  });

  it.each([
    [404, 'TOUR_PRODUCT_NOT_FOUND'],
    [500, 'INTERNAL_ERROR'],
  ])('preserves HTTP %i metadata and decoded error JSON', async (status, code) => {
    server.use(
      http.get(`${baseUrl}/failure`, () =>
        HttpResponse.json({ code, message: 'Synthetic error', fieldErrors: [] }, { status }),
      ),
    );

    try {
      await client.requestJson({ path: '/failure' });
      throw new Error('Expected request to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(BackendHttpError);
      expect(error).toMatchObject({
        response: { status },
        body: { code, fieldErrors: [] },
      });
    }
  });

  it('normalizes a transport failure without fabricating an HTTP status', async () => {
    server.use(http.get(`${baseUrl}/network`, () => HttpResponse.error()));

    await expect(client.requestJson({ path: '/network' })).rejects.toBeInstanceOf(
      BackendNetworkError,
    );
  });

  it('forwards AbortSignal and reports cancellation separately from network failure', async () => {
    server.use(
      http.get(`${baseUrl}/slow`, async () => {
        await delay(200);
        return HttpResponse.json({ completed: true });
      }),
    );

    const controller = new AbortController();
    const pending = client.requestJson({ path: '/slow', signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toBeInstanceOf(BackendRequestAbortedError);
  });

  it('rejects a successful non-JSON response', async () => {
    server.use(
      http.get(
        `${baseUrl}/html`,
        () =>
          new HttpResponse('<html>proxy error</html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }),
      ),
    );

    await expect(client.requestJson({ path: '/html' })).rejects.toMatchObject({
      constructor: BackendMalformedResponseError,
      reason: 'non-json-content-type',
    });
  });

  it('rejects malformed JSON even when the content type claims JSON', async () => {
    server.use(
      http.get(
        `${baseUrl}/malformed`,
        () =>
          new HttpResponse('{broken', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );

    await expect(client.requestJson({ path: '/malformed' })).rejects.toMatchObject({
      constructor: BackendMalformedResponseError,
      reason: 'invalid-json',
    });
  });

  it('rejects request paths that could bypass the configured API base URL', async () => {
    await expect(client.requestJson({ path: 'tours' })).rejects.toThrow(TypeError);
    await expect(client.requestJson({ path: '//other.example.test/tours' })).rejects.toThrow(
      TypeError,
    );
  });
});
