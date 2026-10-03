import { describe, expect, it } from 'vitest';

import { routeBuilders } from '@/app/router/paths';

describe('routeBuilders', () => {
  it('builds approved dynamic Customer routes', () => {
    expect(routeBuilders.tourDetail(101)).toBe('/tours/101');
    expect(routeBuilders.configure(101)).toBe('/tours/101/configure');
    expect(routeBuilders.reservationSuccess('reservation-01')).toBe(
      '/reservation/reservation-01/success',
    );
    expect(routeBuilders.reservationDetail('reservation-01')).toBe('/reservations/reservation-01');
  });

  it('keeps Theme discovery as collection route state instead of a TourProduct route identity', () => {
    expect(routeBuilders.toursByTheme('GOLF_CHALLENGE')).toBe('/tours?theme=GOLF_CHALLENGE');
    expect(routeBuilders.toursByTheme('GOLF_CHALLENGE')).not.toBe('/tours/GOLF_CHALLENGE');
  });

  it('encodes identifiers and discovery state without validating their business shape', () => {
    expect(routeBuilders.tourDetail(42)).toBe('/tours/42');
    expect(routeBuilders.toursByTheme('theme / alpha')).toBe('/tours?theme=theme+%2F+alpha');
    expect(routeBuilders.reservationDetail('reservation / alpha')).toBe(
      '/reservations/reservation%20%2F%20alpha',
    );
  });
});
