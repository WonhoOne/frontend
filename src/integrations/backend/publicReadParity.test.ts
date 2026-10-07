import { describe, expect, it } from 'vitest';

import {
  BackendTourDetailDataSource,
  BackendTourScheduleDataSource,
  MockTourDetailDataSource,
  MockTourScheduleDataSource,
} from '@/features/tour-detail';
import {
  BackendTourDiscoveryDataSource,
  MockTourDiscoveryDataSource,
} from '@/features/tour-discovery';
import type {
  BackendJsonRequest,
  BackendJsonResponse,
} from '@/integrations/backend/client/backendClient';
import {
  BackendHttpError,
  BackendNetworkError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';
import {
  findPublicTourProductDtoFixture,
  getPublicTourScheduleDtoFixtures,
  publicTourProductDtoFixtures,
} from '@/mocks/publicReadFixtures';

function success(body: unknown): BackendJsonResponse {
  return {
    status: 200,
    statusText: 'OK',
    headers: {},
    body,
  };
}

const parityClient = {
  requestJson(request: BackendJsonRequest): Promise<BackendJsonResponse> {
    if (request.signal?.aborted === true) {
      return Promise.reject(new BackendRequestAbortedError());
    }

    if (request.path === '/tours') {
      return Promise.resolve(success(publicTourProductDtoFixtures));
    }

    if (request.path.startsWith('/tours/')) {
      const tourId = Number(request.path.slice('/tours/'.length));
      const product = findPublicTourProductDtoFixture(tourId);

      if (product === null) {
        return Promise.reject(
          new BackendHttpError(
            { status: 404, statusText: 'Not Found', headers: {} },
            {
              code: 'TOUR_PRODUCT_NOT_FOUND',
              message: 'Tour product not found.',
              fieldErrors: [],
            },
          ),
        );
      }

      return Promise.resolve(success(product));
    }

    if (request.path.startsWith('/tour-schedules?')) {
      const url = new URL(request.path, 'https://example.test');
      const tourId = Number(url.searchParams.get('tourId'));
      return Promise.resolve(success(getPublicTourScheduleDtoFixtures(tourId)));
    }

    return Promise.reject(new Error(`Unhandled parity request: ${request.path}`));
  },
};

describe('public read Mock/Real parity', () => {
  it('returns identical Discovery models for the same approved DTO fixtures', async () => {
    const real = new BackendTourDiscoveryDataSource(parityClient);
    const mock = new MockTourDiscoveryDataSource();

    await expect(mock.getTourProducts()).resolves.toEqual(await real.getTourProducts());
  });

  it('returns identical Detail and Schedule models for every fixture TourProduct', async () => {
    const realDetail = new BackendTourDetailDataSource(parityClient);
    const mockDetail = new MockTourDetailDataSource();
    const realSchedules = new BackendTourScheduleDataSource(parityClient);
    const mockSchedules = new MockTourScheduleDataSource();

    for (const product of publicTourProductDtoFixtures) {
      await expect(mockDetail.getTourProduct(product.id)).resolves.toEqual(
        await realDetail.getTourProduct(product.id),
      );
      await expect(mockSchedules.getTourSchedules(product.id)).resolves.toEqual(
        await realSchedules.getTourSchedules(product.id),
      );
    }
  });

  it('keeps unknown-detail and unknown-schedule semantics aligned', async () => {
    const realDetail = new BackendTourDetailDataSource(parityClient);
    const mockDetail = new MockTourDetailDataSource();
    const realSchedules = new BackendTourScheduleDataSource(parityClient);
    const mockSchedules = new MockTourScheduleDataSource();

    await expect(realDetail.getTourProduct(999)).rejects.toMatchObject({
      name: 'BackendHttpError',
      response: { status: 404 },
    });
    await expect(mockDetail.getTourProduct(999)).rejects.toMatchObject({
      name: 'BackendHttpError',
      response: { status: 404 },
    });

    await expect(realSchedules.getTourSchedules(999)).resolves.toEqual([]);
    await expect(mockSchedules.getTourSchedules(999)).resolves.toEqual([]);
  });

  it('uses the same typed abort failure instead of a mock-only DOMException', async () => {
    const controller = new AbortController();
    controller.abort();

    const real = new BackendTourDiscoveryDataSource(parityClient);
    const mock = new MockTourDiscoveryDataSource();

    await expect(real.getTourProducts({ signal: controller.signal })).rejects.toBeInstanceOf(
      BackendRequestAbortedError,
    );
    await expect(mock.getTourProducts({ signal: controller.signal })).rejects.toBeInstanceOf(
      BackendRequestAbortedError,
    );
  });

  it('never falls back to Mock data when the Backend source has a network failure', async () => {
    const failingReal = new BackendTourDiscoveryDataSource({
      requestJson() {
        return Promise.reject(new BackendNetworkError());
      },
    });

    await expect(failingReal.getTourProducts()).rejects.toBeInstanceOf(BackendNetworkError);
  });
});
