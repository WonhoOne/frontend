import { describe, expect, it } from 'vitest';

import {
  isResourceId,
  parseResourceIdRouteParam,
  serializeResourceId,
} from '@/shared/lib/resourceIdentity';

describe('resource identity boundary', () => {
  it('accepts only positive safe integer resource IDs', () => {
    expect(isResourceId(1)).toBe(true);
    expect(isResourceId(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(isResourceId(0)).toBe(false);
    expect(isResourceId(-1)).toBe(false);
    expect(isResourceId(1.5)).toBe(false);
    expect(isResourceId(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
  });

  it('strictly parses canonical decimal route parameters', () => {
    expect(parseResourceIdRouteParam('42')).toBe(42);
    expect(parseResourceIdRouteParam('01')).toBeNull();
    expect(parseResourceIdRouteParam('42x')).toBeNull();
    expect(parseResourceIdRouteParam('1.5')).toBeNull();
    expect(parseResourceIdRouteParam('0')).toBeNull();
    expect(parseResourceIdRouteParam('-1')).toBeNull();
    expect(parseResourceIdRouteParam(undefined)).toBeNull();
  });

  it('serializes only valid resource IDs', () => {
    expect(serializeResourceId(42)).toBe('42');
    expect(() => serializeResourceId(0)).toThrow(TypeError);
  });
});
