import { describe, expect, it } from 'vitest';

import {
  createEmptyReservationDraft,
  hydrateReservationDraft,
  migrateReservationDraft,
  persistReservationDraft,
  RESERVATION_DRAFT_SCHEMA_VERSION,
  RESERVATION_DRAFT_STORAGE_KEY,
  serializeReservationDraft,
  type ReservationDraftStorage,
  type ReservationDraftV1,
} from '@/features/reservation';

class MemoryStorage implements ReservationDraftStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

function configuredDraft(): ReservationDraftV1 {
  return {
    schemaVersion: RESERVATION_DRAFT_SCHEMA_VERSION,
    tourProductId: 101,
    tourScheduleId: 1001,
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'hotel-a',
      transportSelectionKey: 'transport-a',
      mealSelectionKey: 'meal-a',
      extraSelectionKeys: ['extra-a'],
    },
    updatedAt: 100,
  };
}

describe('ReservationDraft persistence', () => {
  it('serializes and restores a valid V1 transaction draft', () => {
    const storage = new MemoryStorage();
    const draft = configuredDraft();

    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));

    expect(hydrateReservationDraft(storage, 999)).toEqual({
      draft,
      hydrationStatus: 'restored',
      persistenceStatus: 'available',
    });
  });

  it('keeps an explicit migration boundary for V1 and rejects unknown schema versions', () => {
    const draft = configuredDraft();

    expect(migrateReservationDraft(draft)).toEqual(draft);
    expect(
      migrateReservationDraft({
        ...draft,
        schemaVersion: 2,
      }),
    ).toBeNull();
  });

  it('drops unknown fields instead of leaking them into restored transaction state', () => {
    const storage = new MemoryStorage();
    const payload = {
      ...configuredDraft(),
      customerContact: 'must-not-survive',
      configuration: {
        ...configuredDraft().configuration,
        serverPrice: 123456,
      },
    };

    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, JSON.stringify(payload));

    const result = hydrateReservationDraft(storage, 999);

    expect(result.hydrationStatus).toBe('restored');
    expect(result.draft).toEqual(configuredDraft());
    expect(result.draft).not.toHaveProperty('customerContact');
    expect(result.draft.configuration).not.toHaveProperty('serverPrice');
  });

  it('discards corrupt JSON and removes the unusable storage entry', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, '{not-json');

    const result = hydrateReservationDraft(storage, 200);

    expect(result).toEqual({
      draft: createEmptyReservationDraft(200),
      hydrationStatus: 'discarded',
      persistenceStatus: 'available',
    });
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('discards an incompatible schema instead of silently parsing it as V1', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      RESERVATION_DRAFT_STORAGE_KEY,
      JSON.stringify({
        ...configuredDraft(),
        schemaVersion: 2,
      }),
    );

    const result = hydrateReservationDraft(storage, 300);

    expect(result.hydrationStatus).toBe('discarded');
    expect(result.draft).toEqual(createEmptyReservationDraft(300));
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('discards a malformed V1 shape', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      RESERVATION_DRAFT_STORAGE_KEY,
      JSON.stringify({
        ...configuredDraft(),
        configuration: {
          ...configuredDraft().configuration,
          extraSelectionKeys: ['extra-a', 42],
        },
      }),
    );

    const result = hydrateReservationDraft(storage, 400);

    expect(result.hydrationStatus).toBe('discarded');
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('marks persistence degraded when storage cannot be read', () => {
    const storage: ReservationDraftStorage = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {},
      removeItem() {},
    };

    expect(hydrateReservationDraft(storage, 500)).toEqual({
      draft: createEmptyReservationDraft(500),
      hydrationStatus: 'empty',
      persistenceStatus: 'degraded',
    });
  });

  it('persists meaningful intent and removes the entry again for an empty draft', () => {
    const storage = new MemoryStorage();
    const draft = configuredDraft();

    expect(persistReservationDraft(storage, draft)).toBe('available');
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));

    expect(persistReservationDraft(storage, createEmptyReservationDraft(600))).toBe('available');
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('reports degraded persistence when a write fails without mutating the draft', () => {
    const draft = configuredDraft();
    const storage: ReservationDraftStorage = {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error('quota');
      },
      removeItem() {},
    };

    expect(persistReservationDraft(storage, draft)).toBe('degraded');
    expect(draft).toEqual(configuredDraft());
  });
});
