import type { ResourceId } from '@/shared/lib/resourceIdentity';

export const RESERVATION_DRAFT_SCHEMA_VERSION = 2 as const;

/**
 * ReservationDraft가 보존하는 canonical Backend resource identity다.
 *
 * CONTRACT: Shared Baseline v0.2에서 TourProduct/TourSchedule identifier는
 * positive integer로 확정됐다. Route string은 route boundary에서만 parse/serialize하고
 * transaction state에는 canonical numeric identity만 보존한다.
 */
export type ReservationDraftResourceIdentity = ResourceId;

export type ReservationDraftTourStyle = 'CLASSIC' | 'GRAND' | 'PREMIUM';
export type ReservationDraftSelectionKey = string;

export interface ReservationDraftConfiguration {
  hotelSelectionKey: ReservationDraftSelectionKey | null;
  transportSelectionKey: ReservationDraftSelectionKey | null;
  mealSelectionKey: ReservationDraftSelectionKey | null;
  readonly extraSelectionKeys: readonly ReservationDraftSelectionKey[];
}

export interface ReservationDraftV2 {
  schemaVersion: typeof RESERVATION_DRAFT_SCHEMA_VERSION;
  tourProductId: ReservationDraftResourceIdentity | null;
  tourScheduleId: ReservationDraftResourceIdentity | null;
  tourStyle: ReservationDraftTourStyle | null;
  participantCount: number | null;
  configuration: ReservationDraftConfiguration;
  updatedAt: number;
}

/** Compatibility alias while downstream F2 names are migrated independently. */
export type ReservationDraftV1 = ReservationDraftV2;

export function createEmptyReservationDraft(updatedAt: number): ReservationDraftV2 {
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
