import {
  createEmptyReservationDraft,
  RESERVATION_DRAFT_SCHEMA_VERSION,
  type ReservationDraftConfiguration,
  type ReservationDraftTourStyle,
  type ReservationDraftV1,
} from '@/features/reservation/ReservationDraft';

/**
 * ReservationDraft를 새로고침·뒤로 가기 사이에 보존하는 sessionStorage 계층 (Master Plan §15).
 *
 * SECURITY: 선택한 id들만 저장한다. 가격, 가용성, 상태, 인증 정보, 고객 개인정보는
 * 저장하지 않는다. 탭을 닫으면 사라지는 sessionStorage를 쓴다.
 *
 * INVARIANT: 저장소를 쓸 수 없어도 앱은 동작한다(`degraded`). 그때는 새로고침 복원만 보장하지 않는다.
 */
export const RESERVATION_DRAFT_STORAGE_KEY = 'mister-world:reservation-draft:v1';

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

function isNullableNonEmptyString(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && value.length > 0);
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (selectionKey: unknown) => typeof selectionKey === 'string' && selectionKey.length > 0,
    )
  );
}

function isTourStyle(value: unknown): value is ReservationDraftTourStyle {
  return value === 'CLASSIC' || value === 'GRAND' || value === 'PREMIUM';
}

function parseConfiguration(value: unknown): ReservationDraftConfiguration | null {
  if (!isRecord(value)) return null;

  const { hotelSelectionKey, transportSelectionKey, mealSelectionKey, extraSelectionKeys } = value;

  if (
    !isNullableNonEmptyString(hotelSelectionKey) ||
    !isNullableNonEmptyString(transportSelectionKey) ||
    !isNullableNonEmptyString(mealSelectionKey) ||
    !isNonEmptyStringArray(extraSelectionKeys)
  ) {
    return null;
  }

  return {
    hotelSelectionKey,
    transportSelectionKey,
    mealSelectionKey,
    extraSelectionKeys: [...extraSelectionKeys],
  };
}

/**
 * 저장된 값을 현재 schema(V1)로 엄격하게 검증한다. 하나라도 맞지 않으면 null이다.
 * WHY: 다른 버전이나 손상된 값을 "대충" 복원하면 잘못된 예약 입력이 될 수 있다.
 */
export function parseReservationDraft(value: unknown): ReservationDraftV1 | null {
  if (!isRecord(value) || value.schemaVersion !== RESERVATION_DRAFT_SCHEMA_VERSION) return null;

  const { tourProductId, tourScheduleId, tourStyle, participantCount, configuration, updatedAt } =
    value;

  if (
    !isNullableNonEmptyString(tourProductId) ||
    !isNullableNonEmptyString(tourScheduleId) ||
    !(tourStyle === null || isTourStyle(tourStyle)) ||
    !(
      participantCount === null ||
      (typeof participantCount === 'number' &&
        Number.isFinite(participantCount) &&
        Number.isInteger(participantCount))
    ) ||
    typeof updatedAt !== 'number' ||
    !Number.isFinite(updatedAt) ||
    updatedAt < 0
  ) {
    return null;
  }

  const parsedConfiguration = parseConfiguration(configuration);
  if (parsedConfiguration === null) return null;

  return {
    schemaVersion: RESERVATION_DRAFT_SCHEMA_VERSION,
    tourProductId,
    tourScheduleId,
    tourStyle,
    participantCount,
    configuration: parsedConfiguration,
    updatedAt,
  };
}

/**
 * 이전 schema를 V1로 옮기는 자리. 현재는 V1만 있으므로 검증과 같다.
 * LIFECYCLE: schema가 바뀌면 여기서만 변환한다.
 */
export function migrateReservationDraft(value: unknown): ReservationDraftV1 | null {
  return parseReservationDraft(value);
}

export function serializeReservationDraft(draft: ReservationDraftV1): string {
  return JSON.stringify(draft);
}

function removeStoredDraft(storage: ReservationDraftStorage): ReservationDraftPersistenceStatus {
  try {
    storage.removeItem(RESERVATION_DRAFT_STORAGE_KEY);
    return 'available';
  } catch {
    return 'degraded';
  }
}

/**
 * 앱 시작 시 Draft 복원.
 * - 저장된 것이 없음 → `empty`
 * - 읽을 수 없거나 schema가 다름 → 저장된 값을 지우고 `discarded` (화면이 사용자에게 알린다)
 * - 정상 → `restored`
 */
export function hydrateReservationDraft(
  storage: ReservationDraftStorage | null,
  emptyDraftUpdatedAt: number,
): ReservationDraftHydrationResult {
  const emptyDraft = createEmptyReservationDraft(emptyDraftUpdatedAt);

  if (storage === null) {
    return { draft: emptyDraft, hydrationStatus: 'empty', persistenceStatus: 'degraded' };
  }

  let serializedDraft: string | null;
  try {
    serializedDraft = storage.getItem(RESERVATION_DRAFT_STORAGE_KEY);
  } catch {
    return { draft: emptyDraft, hydrationStatus: 'empty', persistenceStatus: 'degraded' };
  }

  if (serializedDraft === null) {
    return { draft: emptyDraft, hydrationStatus: 'empty', persistenceStatus: 'available' };
  }

  let unknownDraft: unknown;
  try {
    unknownDraft = JSON.parse(serializedDraft) as unknown;
  } catch {
    return {
      draft: emptyDraft,
      hydrationStatus: 'discarded',
      persistenceStatus: removeStoredDraft(storage),
    };
  }

  const restoredDraft = migrateReservationDraft(unknownDraft);
  if (restoredDraft === null) {
    return {
      draft: emptyDraft,
      hydrationStatus: 'discarded',
      persistenceStatus: removeStoredDraft(storage),
    };
  }

  return { draft: restoredDraft, hydrationStatus: 'restored', persistenceStatus: 'available' };
}

/** 사용자가 무엇이라도 고른 상태인가. 아무것도 없으면 저장 대신 지운다. */
export function hasReservationDraftIntent(draft: ReservationDraftV1): boolean {
  return (
    draft.tourProductId !== null ||
    draft.tourScheduleId !== null ||
    draft.tourStyle !== null ||
    draft.participantCount !== null ||
    draft.configuration.hotelSelectionKey !== null ||
    draft.configuration.transportSelectionKey !== null ||
    draft.configuration.mealSelectionKey !== null ||
    draft.configuration.extraSelectionKeys.length > 0
  );
}

export function persistReservationDraft(
  storage: ReservationDraftStorage | null,
  draft: ReservationDraftV1,
): ReservationDraftPersistenceStatus {
  if (storage === null) return 'degraded';
  if (!hasReservationDraftIntent(draft)) return removeStoredDraft(storage);

  try {
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
    return 'available';
  } catch {
    return 'degraded';
  }
}

/** 브라우저 설정으로 sessionStorage 접근이 막혀도 예외를 던지지 않고 null을 준다. */
export function resolveBrowserSessionStorage(): ReservationDraftStorage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
