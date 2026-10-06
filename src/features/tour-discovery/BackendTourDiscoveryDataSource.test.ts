import { describe, expect, it, vi } from 'vitest';

import { BackendTourDiscoveryDataSource } from '@/features/tour-discovery';
import { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { ContractMappingError } from '@/integrations/backend/contracts';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('BackendTourDiscoveryDataSource', () => {
  it('proves HTTP → decode → adapter → Frontend Model and forwards AbortSignal', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: '41',
          theme: 'GOLF_CHALLENGE',
          name: 'Backend Golf Journey',
          description: 'Backend-owned description.',
          availableStyles: ['CLASSIC', 'GRAND'],
          stylePrices: [
            { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
            { style: 'GRAND', amount: 1800000, currency: 'KRW' },
          ],
        },
      ]),
    );
    const source = new BackendTourDiscoveryDataSource(
      new BackendHttpClient({
        baseUrl: 'https://example.test/api/v1',
        fetchImplementation,
      }),
    );
    const controller = new AbortController();

    const products = await source.getTourProducts({ signal: controller.signal });

    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://example.test/api/v1/tours',
      expect.objectContaining({
        method: 'GET',
        signal: controller.signal,
      }),
    );
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: 41,
      theme: 'GOLF_CHALLENGE',
      name: 'Backend Golf Journey',
      availableStyles: ['CLASSIC', 'GRAND'],
      stylePrices: [
        { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
        { style: 'GRAND', amount: 1800000, currency: 'KRW' },
      ],
    });
  });

  it('rejects malformed 200 payloads before they reach the Frontend Model', async () => {
    const source = new BackendTourDiscoveryDataSource(
      new BackendHttpClient({
        baseUrl: '/api/v1',
        fetchImplementation: vi.fn().mockResolvedValue(
          jsonResponse([
            {
              id: 41,
              theme: 'GOLF_CHALLENGE',
              name: 'Backend Golf Journey',
              description: 'Backend-owned description.',
              availableStyles: ['CLASSIC'],
              stylePrices: [],
            },
          ]),
        ),
      }),
    );

    await expect(source.getTourProducts()).rejects.toBeInstanceOf(ContractMappingError);
  });
});
