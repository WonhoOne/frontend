export type BackendResourceId = number;
export type ResourceId = BackendResourceId;
export type CanonicalBackendResourceIdentity = string;

export function isResourceId(value: unknown): value is ResourceId {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

export function parseBackendResourceIdentity(value: string | undefined): BackendResourceId | null {
  if (value === undefined || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return isResourceId(parsed) ? parsed : null;
}

export const parseResourceIdRouteParam = parseBackendResourceIdentity;

export function toCanonicalBackendResourceIdentity(
  value: BackendResourceId,
): CanonicalBackendResourceIdentity {
  if (!isResourceId(value)) {
    throw new TypeError('Backend resource identity must be a positive safe integer.');
  }

  return String(value);
}

export const serializeResourceId = toCanonicalBackendResourceIdentity;
