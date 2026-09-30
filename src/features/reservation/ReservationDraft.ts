export const RESERVATION_DRAFT_SCHEMA_VERSION = 1 as const;

/**
 * ReservationDraft가 보존하는 Frontend transaction identity다.
 *
 * CONTRACT: 승인된 docs/main v0.1.2는 REST identifier의 wire type을 확정하지 않았다.
 * CP3의 Draft V1은 route-safe string identity를 사용하므로 C1은 그 경계를 유지한다.
 * 이 type을 Backend DTO/DB identity 계약으로 해석하지 않는다.
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

/**
 * 새 transaction 또는 명시적 clear 뒤에 사용할 비어 있는 Draft를 만든다.
 *
 * INVARIANT:
 * - participantCount는 Frontend가 숨은 1/2 기본값을 만들지 않도록 null로 시작한다.
 * - Server truth인 price/availability/recruitment/status와 개인정보는 Draft shape에 없다.
 */
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
