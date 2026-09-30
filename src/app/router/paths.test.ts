import { describe, expect, it } from 'vitest';

import { routeBuilders } from '@/app/router/paths';

describe('routeBuilders', () => {
  it('builds approved dynamic Customer routes', () => {
    expect(routeBuilders.tourDetail('tour-01')).toBe('/tours/tour-01');
    expect(routeBuilders.configure('tour-01')).toBe('/tours/tour-01/configure');
    expect(routeBuilders.reservationSuccess('reservation-01')).toBe(
      '/reservation/reservation-01/success',
    );
    expect(routeBuilders.reservationDetail('reservation-01')).toBe('/reservations/reservation-01');
  });

  it('encodes identifiers as a single URL path segment without validating their business shape', () => {
    expect(routeBuilders.tourDetail('tour / alpha')).toBe('/tours/tour%20%2F%20alpha');
    expect(routeBuilders.reservationDetail('reservation / alpha')).toBe(
      '/reservations/reservation%20%2F%20alpha',
    );
  });
});
