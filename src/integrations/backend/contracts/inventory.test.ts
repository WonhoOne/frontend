import { describe, expect, it } from 'vitest';

import { ContractMappingError } from '@/integrations/backend/contracts/contractMappingError';
import {
  decodeInventoryDto,
  decodeInventoryListDto,
} from '@/integrations/backend/contracts/inventory';

describe('Inventory contract', () => {
  it('decodes the four fixed items including zero stock', () => {
    expect(
      decodeInventoryListDto([
        { id: 1, itemType: 'COUPLE_TSHIRT', quantity: 12 },
        { id: 2, itemType: 'GINSENG_GIFT', quantity: 0 },
      ]),
    ).toEqual([
      { id: 1, itemType: 'COUPLE_TSHIRT', quantity: 12 },
      { id: 2, itemType: 'GINSENG_GIFT', quantity: 0 },
    ]);
  });

  it.each([
    [{ id: 1, itemType: 'WINE', quantity: 1 }],
    [{ id: 1, itemType: 'GOLF_BALL', quantity: -1 }],
    [{ id: 1, itemType: 'GOLF_BALL', quantity: 1.5 }],
    [{ id: 1, itemType: 'GOLF_BALL', quantity: Number.MAX_SAFE_INTEGER + 1 }],
    [{ id: 0, itemType: 'GOLF_BALL', quantity: 1 }],
    [{ itemType: 'GOLF_BALL', quantity: 1 }],
  ])('rejects a value it cannot represent exactly: %j', (value) => {
    expect(() => decodeInventoryDto(value)).toThrow(ContractMappingError);
  });

  it('rejects a non-array list', () => {
    expect(() => decodeInventoryListDto({ items: [] })).toThrow(ContractMappingError);
  });
});
