import { http, HttpResponse, type RequestHandler } from 'msw';

/**
 * Shared development/test mock registry.
 *
 * Mock runtime is still gated by DEV + VITE_ENABLE_MOCKS=true in application
 * bootstrap. The public TourProduct list endpoint is now an approved v0.2
 * contract, so an empty collection is a valid contract-shaped baseline.
 */
export const handlers: RequestHandler[] = [
  http.get('/api/v1/tours', () => HttpResponse.json([])),
];
