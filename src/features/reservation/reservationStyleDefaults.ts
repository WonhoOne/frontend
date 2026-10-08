import type {
  ReservationDraftConfiguration,
  ReservationDraftTourStyle,
} from '@/features/reservation/ReservationDraft';

/**
 * Shared product-catalog v0.2 TourStyle defaults.
 *
 * Use ONLY when BEGIN_CONFIGURE creates a new transaction, never during
 * rendering, rehydration, style edits or navigation. Transport is Theme-owned
 * and is deliberately unset here (no Theme in the public handoff contract).
 * Prices and availability remain Backend-owned.
 */
const STYLE_DEFAULTS: Record<
  ReservationDraftTourStyle,
  {
    hotelSelectionKey: string;
    mealSelectionKey: string;
    extraSelectionKeys: readonly string[];
  }
> = {
  CLASSIC: {
    hotelSelectionKey: 'HOTEL_3_STAR',
    mealSelectionKey: 'LUNCH_BOX',
    extraSelectionKeys: [],
  },
  GRAND: {
    hotelSelectionKey: 'HOTEL_4_STAR',
    mealSelectionKey: 'LOCAL_RESTAURANT',
    extraSelectionKeys: [],
  },
  PREMIUM: {
    hotelSelectionKey: 'HOTEL_5_STAR',
    mealSelectionKey: 'PREMIUM_RESTAURANT',
    extraSelectionKeys: ['CHAMPAGNE'],
  },
};

export function createStyleDefaultConfiguration(
  style: ReservationDraftTourStyle,
): ReservationDraftConfiguration {
  const defaults = STYLE_DEFAULTS[style];
  return {
    hotelSelectionKey: defaults.hotelSelectionKey,
    transportSelectionKey: null,
    mealSelectionKey: defaults.mealSelectionKey,
    extraSelectionKeys: [...defaults.extraSelectionKeys],
  };
}
