import { describe, expect, it } from 'vitest';

import {
  createRuntimeConfig,
  normalizeApiBaseUrl,
  RuntimeConfigError,
} from '@/app/config/runtimeConfig';

describe('runtimeConfig', () => {
  it('defaults to the same-origin v0.2 API base path', () => {
    expect(createRuntimeConfig({})).toEqual({ apiBaseUrl: '/api/v1' });
  });

  it('normalizes relative and absolute API base URLs without trailing slashes', () => {
    expect(normalizeApiBaseUrl('/api/v1/')).toBe('/api/v1');
    expect(normalizeApiBaseUrl('https://api.example.test/api/v1/')).toBe(
      'https://api.example.test/api/v1',
    );
  });

  it.each(['', '   ', 'api/v1', '//api.example.test/api/v1', 'ftp://api.example.test/api/v1'])(
    'rejects invalid API base URL %j',
    (value) => {
      expect(() => normalizeApiBaseUrl(value)).toThrow(RuntimeConfigError);
    },
  );

  it.each([
    '/api/v1?token=not-allowed',
    '/api/v1#fragment',
    'https://user:password@api.example.test/api/v1',
    'https://api.example.test/api/v1?debug=true',
  ])('rejects unsafe API base URL %j', (value) => {
    expect(() => normalizeApiBaseUrl(value)).toThrow(RuntimeConfigError);
  });
});
