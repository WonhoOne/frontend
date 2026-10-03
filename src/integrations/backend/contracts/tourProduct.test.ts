import { describe, expect, it } from 'vitest';

import {
  ContractMappingError,
  decodeTourProductDto,
  decodeTourProductListDto,
} from '@/integrations/backend/contracts';

const validProduct = {
  id: 201,
  theme: 'GOLF_CHALLENGE',
  name: 'Synthetic Golf',
  description: 'Synthetic description',
  availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
  stylePrices: [
    { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
    { style: 'GRAND', amount: 1800000, currency: 'KRW' },
    { style: 'PREMIUM', amount: 2500000, currency: 'KRW' },
  ],
};

describe('TourProduct runtime contract', () => {
  it('decodes the approved v0.2 representation without leaking extra fields', () => {
    expect(decodeTourProductDto({ ...validProduct, image: '/not-a-backend-field.jpg' })).toEqual(
      validProduct,
    );
  });

  it.each([
    ['missing id', { ...validProduct, id: undefined }, '$.id', 'expected-positive-integer'],
    ['zero id', { ...validProduct, id: 0 }, '$.id', 'expected-positive-integer'],
    ['fractional id', { ...validProduct, id: 1.5 }, '$.id', 'expected-positive-integer'],
    [
      'unsafe id',
      { ...validProduct, id: Number.MAX_SAFE_INTEGER + 1 },
      '$.id',
      'expected-positive-integer',
    ],
    ['unknown theme', { ...validProduct, theme: 'UNKNOWN' }, '$.theme', 'unknown-enum'],
    [
      'unknown style',
      { ...validProduct, availableStyles: ['CLASSIC', 'UNKNOWN'] },
      '$.availableStyles[1]',
      'unknown-enum',
    ],
    [
      'wrong description type',
      { ...validProduct, description: 7 },
      '$.description',
      'expected-string',
    ],
  ] as const)('rejects %s', (_name, payload, path, reason) => {
    expect(() => decodeTourProductDto(payload)).toThrowError(
      expect.objectContaining({ path, reason }),
    );
  });

  it.each([
    [
      'nonpositive money',
      [{ style: 'CLASSIC', amount: 0, currency: 'KRW' }],
      'expected-positive-integer',
    ],
    ['wrong currency', [{ style: 'CLASSIC', amount: 10, currency: 'USD' }], 'invalid-money'],
  ] as const)('rejects %s', (_name, stylePrices, reason) => {
    expect(() =>
      decodeTourProductDto({
        ...validProduct,
        availableStyles: ['CLASSIC'],
        stylePrices,
      }),
    ).toThrowError(expect.objectContaining({ reason }));
  });

  it('rejects duplicate or inconsistent style-price coverage without reimplementing Theme rules', () => {
    expect(() =>
      decodeTourProductDto({
        ...validProduct,
        availableStyles: ['GRAND', 'GRAND'],
        stylePrices: [
          { style: 'GRAND', amount: 10, currency: 'KRW' },
          { style: 'GRAND', amount: 20, currency: 'KRW' },
        ],
      }),
    ).toThrowError(expect.objectContaining({ reason: 'duplicate-value' }));

    expect(() =>
      decodeTourProductDto({
        ...validProduct,
        availableStyles: ['CLASSIC', 'GRAND'],
        stylePrices: [{ style: 'CLASSIC', amount: 10, currency: 'KRW' }],
      }),
    ).toThrowError(expect.objectContaining({ reason: 'inconsistent-style-prices' }));
  });

  it('decodes plain-array collections and reports the failing item path', () => {
    expect(decodeTourProductListDto([validProduct, { ...validProduct, id: 202 }])).toHaveLength(2);

    expect(() =>
      decodeTourProductListDto([validProduct, { ...validProduct, theme: 'NEW_THEME' }]),
    ).toThrowError(
      expect.objectContaining({
        contract: 'TourProduct',
        path: '$[1].theme',
        reason: 'unknown-enum',
      }),
    );
  });

  it('uses ContractMappingError rather than a cast for malformed wire data', () => {
    expect(() => decodeTourProductDto(null)).toThrow(ContractMappingError);
  });
});
