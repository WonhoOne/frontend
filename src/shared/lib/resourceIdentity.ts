export type ResourceId = number;

export function isResourceId(value: unknown): value is ResourceId {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

export function parseResourceIdRouteParam(value: string | undefined): ResourceId | null {
  if (value === undefined || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return isResourceId(parsed) ? parsed : null;
}

export function serializeResourceId(value: ResourceId): string {
  if (!isResourceId(value))
    throw new TypeError('Resource identity must be a positive safe integer.');
  return String(value);
}
