import { describe, expect, it } from 'vitest';

import { formatKrw } from '@/shared/lib/formatKrw';

describe('formatKrw', () => {
  it('formats integers the way Customer screens already do', () => {
    expect(formatKrw(1200000)).toBe('₩1,200,000');
    expect(formatKrw(0)).toBe('₩0');
  });

  it('refuses values it cannot show exactly', () => {
    expect(() => formatKrw(1.5)).toThrow(RangeError);
    expect(() => formatKrw(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });
});
