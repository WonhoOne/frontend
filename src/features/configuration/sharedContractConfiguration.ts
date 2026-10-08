import type { ConfigureScenario } from '@/features/configuration/configurationFixtures';

function option(selectionKey: string, title: string, description: string) {
  return {
    selectionKey,
    title,
    description,
    availability: { status: 'selectable' as const },
    visual: null,
  };
}

/**
 * Shared REST Contract v0.2 configuration catalog used by the live Reservation
 * journey. The Backend exposes no option-catalog endpoint in v0.2, so these
 * canonical IDs come directly from the approved Shared contract.
 *
 * Optional Extras use the v0.2 canonical identities directly. Selection and
 * user intent are owned by ReservationDraft, not a secondary local UI state.
 */
export function createSharedContractConfigureScenario(): ConfigureScenario {
  return {
    source: 'shared-contract',
    scenarioId: 'shared-v0.2',
    groups: [
      {
        category: 'hotel',
        heading: 'Hotel',
        helperText: null,
        required: true,
        selectionMode: 'single',
        options: [
          option('HOTEL_3_STAR', '3-star hotel', 'Standard three-star accommodation.'),
          option('HOTEL_4_STAR', '4-star hotel', 'Four-star accommodation.'),
          option('HOTEL_5_STAR', '5-star hotel', 'Five-star accommodation.'),
        ],
      },
      {
        category: 'transport',
        heading: 'Transport',
        helperText: null,
        required: true,
        selectionMode: 'single',
        options: [
          option(
            'PRIVATE_LUXURY_CAR_2',
            'Private luxury car (2)',
            'Private car option with capacity for two participants.',
          ),
          option(
            'PREMIUM_VAN_10',
            'Premium van (10)',
            'Premium van option with capacity for up to ten participants.',
          ),
        ],
      },
      {
        category: 'meal',
        heading: 'Meal',
        helperText: null,
        required: true,
        selectionMode: 'single',
        options: [
          option('LUNCH_BOX', 'Lunch box', 'Prepared lunch-box meal option.'),
          option('LOCAL_RESTAURANT', 'Local restaurant', 'Local restaurant meal option.'),
          option('PREMIUM_RESTAURANT', 'Premium restaurant', 'Premium restaurant meal option.'),
        ],
      },
      {
        category: 'extras',
        heading: 'Extras',
        helperText: 'Optional additions. Select any combination.',
        required: false,
        selectionMode: 'multiple',
        options: [
          option('CHAMPAGNE', 'Champagne', 'Optional champagne.'),
          option('COFFEE', 'Coffee', 'Optional coffee.'),
        ],
      },
    ],
    tripSummary: {
      themeLabel: 'Selected theme',
      styleLabel: 'Selected style',
      scheduleLabel: 'Selected schedule',
      participantLabel: null,
      selections: {
        hotelLabel: null,
        transportLabel: null,
        mealLabel: null,
        extraLabels: [],
      },
      invalidSelections: [],
      price: {
        state: 'unavailable',
        message: 'Final Reservation price is confirmed by Backend on create.',
      },
    },
  };
}
