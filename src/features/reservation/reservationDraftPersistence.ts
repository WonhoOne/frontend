import {
  createEmptyReservationDraft,
  RESERVATION_DRAFT_SCHEMA_VERSION,
  type ReservationDraftConfiguration,
  type ReservationDraftTourStyle,
  type ReservationDraftV1,
} from '@/features/reservation/ReservationDraft';
import { isResourceId } from '@/shared/lib/resourceIdentity';

export const RESERVATION_DRAFT_STORAGE_KEY = 'mister-world:reservation-draft:v2';
export const LEGACY_RESERVATION_DRAFT_STORAGE_KEY = 'mister-world:reservation-draft:v1';

export interface ReservationDraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type ReservationDraftPersistenceStatus = 'available' | 'degraded';
export type ReservationDraftHydrationStatus = 'empty' | 'restored' | 'discarded';

export interface ReservationDraftHydrationResult {
  draft: ReservationDraftV1;
  hydrationStatus: ReservationDraftHydrationStatus;
  persistenceStatus: ReservationDraftPersistenceStatus;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableResourceId(value: unknown) {
  return value === null || isResourceId(value);
}

function isNullableNonEmptyString(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && value.length > 0);
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(
    (selectionKey: unknown) => typeof selectionKey === 'string' && selectionKey.length > 0,
  );
}

function isTourStyle(value: unknown): value is ReservationDraftTourStyle {
  return value === 'CLASSIC' || value === 'GRAND' || value === 'PREMIUM';
}

function parseConfiguration(value: unknown): ReservationDraftConfiguration | null {
  if (!isRecord(value)) return null;
  const { hotelSelectionKey, transportSelectionKey, mealSelectionKey, extraSelectionKeys } = value;
  if (!isNullableNonEmptyString(hotelSelectionKey) ||
      !isNullableNonEmptyString(transportSelectionKey) ||
      !isNullableNonEmptyString(mealSelectionKey) ||
      !isNonEmptyStringArray(extraSelectionKeys)) return null;
  return { hotelSelectionKey, transportSelectionKey, mealSelectionKey, extraSelectionKeys: [...extraSelectionKeys] };
}

export function parseReservationDraft(value: unknown): ReservationDraftV1 | null {
  if (!isRecord(value) || value.schemaVersion !== RESERVATION_DRAFT_SCHEMA_VERSION) return null;
  const { tourProductId, tourScheduleId, tourStyle, participantCount, configuration, updatedAt } = value;
  if (!isNullableResourceId(tourProductId) ||
      !isNullableResourceId(tourScheduleId) ||
      !(tourStyle === null || isTourStyle(tourStyle)) ||
      !(participantCount === null || (typeof participantCount === 'number' && Number.isFinite(participantCount) && Number.isInteger(participantCount))) ||
      typeof updatedAt !== 'number' || !Number.isFinite(updatedAt) || updatedAt < 0) return null;
  const parsedConfiguration = parseConfiguration(configuration);
  if (parsedConfiguration === null) return null;
  return { schemaVersion: RESERVATION_DRAFT_SCHEMA_VERSION, tourProductId, tourScheduleId, tourStyle, participantCount, configuration: parsedConfiguration, updatedAt };
}

export function migrateReservationDraft(value: unknown): ReservationDraftV1 | null {
  if (!isRecord(value) || value.schemaVersion !== RESERVATION_DRAFT_SCHEMA_VERSION) return null;
  return parseReservationDraft(value);
}

export function serializeReservationDraft(draft: ReservationDraftV1): string {
  return JSON.stringify(draft);
}

function removeStoredDraft(storage: ReservationDraftStorage, key = RESERVATION_DRAFT_STORAGE_KEY): ReservationDraftPersistenceStatus {
  try {
    storage.removeItem(key);
    return 'available';
  } catch {
    return 'degraded';
  }
}

export function hydrateReservationDraft(storage: ReservationDraftStorage | null, emptyDraftUpdatedAt: number): ReservationDraftHydrationResult {
  const emptyDraft = createEmptyReservationDraft(emptyDraftUpdatedAt);
  if (storage === null) return { draft: emptyDraft, hydrationStatus: 'empty', persistenceStatus: 'degraded' };

  try {
    const serializedDraft = storage.getItem(RESERVATION_DRAFT_STORAGE_KEY);
    if (serializedDraft !== null) {
      let unknownDraft: unknown;
      try {
        unknownDraft = JSON.parse(serializedDraft) as unknown;
      } catch {
        return { draft: emptyDraft, hydrationStatus: 'discarded', persistenceStatus: removeStoredDraft(storage) };
      }
      const restoredDraft = migrateReservationDraft(unknownDraft);
      if (restoredDraft === null) return { draft: emptyDraft, hydrationStatus: 'discarded', persistenceStatus: removeStoredDraft(storage) };
      return { draft: restoredDraft, hydrationStatus: 'restored', persistenceStatus: 'available' };
    }

    if (storage.getItem(LEGACY_RESERVATION_DRAFT_STORAGE_KEY) !== null) {
      return { draft: emptyDraft, hydrationStatus: 'discarded', persistenceStatus: removeStoredDraft(storage, LEGACY_RESERVATION_DRAFT_STORAGE_KEY) };
    }

    return { draft: emptyDraft, hydrationStatus: 'empty', persistenceStatus: 'available' };
  } catch {
    return { draft: emptyDraft, hydrationStatus: 'empty', persistenceStatus: 'degraded' };
  }
}

export function hasReservationDraftIntent(draft: ReservationDraftV1): boolean {
  return draft.tourProductId !== null || draft.tourScheduleId !== null || draft.tourStyle !== null ||
    draft.participantCount !== null || draft.configuration.hotelSelectionKey !== null ||
    draft.configuration.transportSelectionKey !== null || draft.configuration.mealSelectionKey !== null ||
    draft.configuration.extraSelectionKeys.length > 0;
}

export function persistReservationDraft(storage: ReservationDraftStorage | null, draft: ReservationDraftV1): ReservationDraftPersistenceStatus {
  if (storage === null) return 'degraded';
  if (!hasReservationDraftIntent(draft)) return removeStoredDraft(storage);
  try {
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
    return 'available';
  } catch {
    return 'degraded';
  }
}

export function resolveBrowserSessionStorage(): ReservationDraftStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
