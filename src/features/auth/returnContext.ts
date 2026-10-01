import { RESERVATION_DRAFT_SCHEMA_VERSION } from '@/features/reservation';

export const RETURN_CONTEXT_SCHEMA_VERSION = 1 as const;
export const RETURN_CONTEXT_STORAGE_KEY = 'mister-world:return-context:v1';
export const RETURN_CONTEXT_MAX_AGE_MS = 30 * 60 * 1000;

export type ReturnIntent = 'continue-navigation' | 'resume-reservation-review';

export interface ReturnContextV1 {
  schemaVersion: typeof RETURN_CONTEXT_SCHEMA_VERSION;
  returnTo: string;
  intent: ReturnIntent;
  draftSchemaVersion: number;
  createdAt: number;
}

export interface ReturnContextStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

let memoryContext: ReturnContextV1 | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSafeInternalReturnTo(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return false;
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
    return false;
  }

  try {
    const parsed = new URL(value, 'https://mister-world.invalid');
    return parsed.origin === 'https://mister-world.invalid' && parsed.pathname.startsWith('/');
  } catch {
    return false;
  }
}

export function parseReturnContext(value: unknown, now = Date.now()): ReturnContextV1 | null {
  if (!isRecord(value)) {
    return null;
  }

  const { schemaVersion, returnTo, intent, draftSchemaVersion, createdAt } = value;

  if (
    schemaVersion !== RETURN_CONTEXT_SCHEMA_VERSION ||
    !isSafeInternalReturnTo(returnTo) ||
    !(intent === 'continue-navigation' || intent === 'resume-reservation-review') ||
    typeof draftSchemaVersion !== 'number' ||
    !Number.isInteger(draftSchemaVersion) ||
    draftSchemaVersion !== RESERVATION_DRAFT_SCHEMA_VERSION ||
    typeof createdAt !== 'number' ||
    !Number.isFinite(createdAt) ||
    createdAt < 0 ||
    createdAt > now ||
    now - createdAt > RETURN_CONTEXT_MAX_AGE_MS
  ) {
    return null;
  }

  return {
    schemaVersion: RETURN_CONTEXT_SCHEMA_VERSION,
    returnTo,
    intent,
    draftSchemaVersion,
    createdAt,
  };
}

function removeStoredContext(storage: ReturnContextStorage | null) {
  if (storage === null) {
    return;
  }

  try {
    storage.removeItem(RETURN_CONTEXT_STORAGE_KEY);
  } catch {
    // Storage failure degrades to memory-only navigation recovery.
  }
}

export function saveReturnContext(
  context: Omit<ReturnContextV1, 'schemaVersion' | 'draftSchemaVersion'>,
  storage = resolveReturnContextSessionStorage(),
  now = Date.now(),
): boolean {
  const candidate = parseReturnContext(
    {
      ...context,
      schemaVersion: RETURN_CONTEXT_SCHEMA_VERSION,
      draftSchemaVersion: RESERVATION_DRAFT_SCHEMA_VERSION,
    },
    now,
  );

  if (candidate === null) {
    return false;
  }

  memoryContext = candidate;

  if (storage !== null) {
    try {
      // SECURITY: only validated navigation metadata is persisted. Credentials,
      // bearer material, customer data, and ReservationDraft content never enter this value.
      storage.setItem(RETURN_CONTEXT_STORAGE_KEY, JSON.stringify(candidate));
    } catch {
      // Memory remains authoritative when sessionStorage is unavailable.
    }
  }

  return true;
}

export function consumeReturnContext(
  storage = resolveReturnContextSessionStorage(),
  now = Date.now(),
): ReturnContextV1 | null {
  const memoryCandidate = memoryContext === null ? null : parseReturnContext(memoryContext, now);
  memoryContext = null;

  if (memoryCandidate !== null) {
    removeStoredContext(storage);
    return memoryCandidate;
  }

  if (storage === null) {
    return null;
  }

  let serialized: string | null;
  try {
    serialized = storage.getItem(RETURN_CONTEXT_STORAGE_KEY);
  } catch {
    return null;
  }

  if (serialized === null) {
    return null;
  }

  let unknownContext: unknown;
  try {
    unknownContext = JSON.parse(serialized) as unknown;
  } catch {
    removeStoredContext(storage);
    return null;
  }

  const restored = parseReturnContext(unknownContext, now);
  removeStoredContext(storage);
  return restored;
}

export function clearReturnContext(storage = resolveReturnContextSessionStorage()) {
  memoryContext = null;
  removeStoredContext(storage);
}

export function resolveReturnContextSessionStorage(): ReturnContextStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
