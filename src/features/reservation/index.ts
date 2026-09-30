export {
  createEmptyReservationDraft,
  RESERVATION_DRAFT_SCHEMA_VERSION,
  type ReservationDraftConfiguration,
  type ReservationDraftResourceIdentity,
  type ReservationDraftSelectionKey,
  type ReservationDraftTourStyle,
  type ReservationDraftV1,
} from '@/features/reservation/ReservationDraft';
export {
  ReservationDraftContext,
  useReservationDraft,
  type ReservationDraftContextValue,
} from '@/features/reservation/reservationDraftContext';
export { ReservationDraftProvider } from '@/features/reservation/ReservationDraftProvider';
export {
  hasReservationDraftIntent,
  hydrateReservationDraft,
  migrateReservationDraft,
  parseReservationDraft,
  persistReservationDraft,
  RESERVATION_DRAFT_STORAGE_KEY,
  resolveBrowserSessionStorage,
  serializeReservationDraft,
  type ReservationDraftHydrationResult,
  type ReservationDraftHydrationStatus,
  type ReservationDraftPersistenceStatus,
  type ReservationDraftStorage,
} from '@/features/reservation/reservationDraftPersistence';
export {
  reservationDraftReducer,
  type ReservationDraftAction,
} from '@/features/reservation/reservationDraftReducer';

export {
  formatParticipantCountSummary,
  validateParticipantCount,
  type ParticipantCountRule,
  type ParticipantCountValidation,
} from '@/features/reservation/participantCount';

export {
  getConfigureDraftEntryState,
  getReviewDraftHandoffState,
  type ConfigureDraftEntryState,
  type ReviewDraftHandoffState,
} from '@/features/reservation/reservationDraftRecovery';

export {
  createConfigureHandoffAction,
  type BeginConfigureAction,
  type ConfigureHandoffIntent,
} from '@/features/reservation/configureHandoff';
