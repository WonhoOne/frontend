export const RESERVATION_DRAFT_SCHEMA_VERSION = 1 as const;

/**
 * ReservationDraft가 보존하는 Frontend transaction identity다.
 *
 * Shared Baseline v0.2에서 Backend REST ID는 positive integer로 닫혔지만,
 * Draft는 route/persistence/frontend transaction identity를 string으로 유지한다.
 * Real Backend resource는 canonical decimal string을 사용하고 DEV mock composition은
 * 명시적인 opaque string identity를 사용할 수 있다.
 */
export type ReservationDraftResourceIdentity = string;

export type ReservationDraftTourStyle = 'CLASSIC' | 'GRAND' | 'PREMIUM';

export type ReservationDraftSelectionKey = string;

export interface ReservationDraftConfiguration {
  hotelSelectionKey: ReservationDraftSelectionKey | null;
  transportSelectionKey: ReservationDraftSelectionKey | null;
  mealSelectionKey: ReservationDraftSelectionKey | null;
  readonly extraSelectionKeys: readonly ReservationDraftSelectionKey[];
}

export interface ReservationDraftV1 {
  schemaVersion: typeof RESERVATION_DRAFT_SCHEMA_VERSION;
  tourProductId: ReservationDraftResourceIdentity | null;
  tourScheduleId: ReservationDraftResourceIdentity | null;
  tourStyle: ReservationDraftTourStyle | null;
  participantCount: number | null;
  configuration: ReservationDraftConfiguration;
  updatedAt: number;
}

export function createEmptyReservationDraft(updatedAt: number): ReservationDraftV1 {
  return {
    schemaVersion: RESERVATION_DRAFT_SCHEMA_VERSION,
    tourProductId: null,
    tourScheduleId: null,
    tourStyle: null,
    participantCount: null,
    configuration: {
      hotelSelectionKey: null,
      transportSelectionKey: null,
      mealSelectionKey: null,
      extraSelectionKeys: [],
    },
    updatedAt,
  };
}
