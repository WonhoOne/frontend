import type { ResourceId } from '@/shared/lib/resourceIdentity';

export const RESERVATION_DRAFT_SCHEMA_VERSION = 2 as const;

/** Canonical Backend resource identity fixed by Shared Baseline v0.2. */
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

/** Compatibility alias; persisted schema is V2. */
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
