import { describe, expect, it, vi } from 'vitest';

import { BackendTourDetailDataSource } from '@/features/tour-detail';
import { BackendHttpClient } from '@/integrations/backend/client/backendClient';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('BackendTourDetailDataSource', () => {
  it('proves HTTP → decode → adapter → detail model and forwards AbortSignal', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(
      jsonResponse({
        id: 103,
        theme: 'GOLF_CHALLENGE',
        name: 'Backend Golf Journey',
        description: 'Backend-owned product description.',
        availableStyles: ['CLASSIC', 'GRAND'],
        stylePrices: [
          { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
          { style: 'GRAND', amount: 1800000, currency: 'KRW' },
        ],
      }),
    );
    const source = new BackendTourDetailDataSource(
      new BackendHttpClient({
        baseUrl: 'https://example.test/api/v1',
        fetchImplementation,
      }),
    );
    const controller = new AbortController();

    const model = await source.getTourProduct(103, { signal: controller.signal });

    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://example.test/api/v1/tours/103',
      expect.objectContaining({ method: 'GET', signal: controller.signal }),
    );
    expect(model).toMatchObject({
      id: 103,
      name: 'Backend Golf Journey',
      summary: 'Backend-owned product description.',
    });
  });
});
