import { describe, expect, it } from 'vitest';

import {
  isResourceId,
  parseBackendResourceIdentity,
  parseResourceIdRouteParam,
  serializeResourceId,
  toCanonicalBackendResourceIdentity,
} from '@/shared/lib/resourceIdentity';

describe('resource identity boundary', () => {
  it('accepts only positive safe integer Backend resource IDs', () => {
    expect(isResourceId(1)).toBe(true);
    expect(isResourceId(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(isResourceId(0)).toBe(false);
    expect(isResourceId(-1)).toBe(false);
    expect(isResourceId(1.5)).toBe(false);
    expect(isResourceId(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
  });

  it('strictly parses only canonical decimal Backend identities', () => {
    expect(parseBackendResourceIdentity('1')).toBe(1);
    expect(parseResourceIdRouteParam('42')).toBe(42);
    expect(parseBackendResourceIdentity(String(Number.MAX_SAFE_INTEGER))).toBe(
      Number.MAX_SAFE_INTEGER,
    );

    for (const invalid of ['', '0', '-1', '1.5', '01', ' 1', '1 ', '1foo', 'fixture:schedule:a']) {
      expect(parseBackendResourceIdentity(invalid)).toBeNull();
    }

    expect(parseBackendResourceIdentity(String(Number.MAX_SAFE_INTEGER + 1))).toBeNull();
    expect(parseBackendResourceIdentity(undefined)).toBeNull();
  });

  it('formats Backend IDs as canonical decimal frontend identities with round-trip safety', () => {
    for (const backendId of [1, 42, Number.MAX_SAFE_INTEGER]) {
      const frontendIdentity = toCanonicalBackendResourceIdentity(backendId);

      expect(frontendIdentity).toBe(String(backendId));
      expect(parseBackendResourceIdentity(frontendIdentity)).toBe(backendId);
      expect(serializeResourceId(backendId)).toBe(frontendIdentity);
    }

    expect(() => toCanonicalBackendResourceIdentity(0)).toThrow(TypeError);
  });
});
