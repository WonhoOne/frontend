import { describe, expect, it } from 'vitest';

import {
  adaptInventoryList,
  InventoryShapeError,
} from '@/features/employee-inventory/inventory.adapter';

const four = [
  { id: 1, itemType: 'COUPLE_TSHIRT', quantity: 12 },
  { id: 2, itemType: 'GINSENG_GIFT', quantity: 0 },
  { id: 3, itemType: 'GOLF_BALL', quantity: 35 },
  { id: 4, itemType: 'SCARF', quantity: 8 },
] as const;

describe('adaptInventoryList', () => {
  it('keeps Backend order and drops ids', () => {
    expect(adaptInventoryList(four).map(({ itemType }) => itemType)).toEqual([
      'COUPLE_TSHIRT',
      'GINSENG_GIFT',
      'GOLF_BALL',
      'SCARF',
    ]);
  });

  it.each([
    [[]],
    [four.slice(0, 3)],
    [[...four.slice(0, 3), { id: 5, itemType: 'GOLF_BALL', quantity: 1 }]],
  ])('refuses anything other than each fixed item exactly once', (list) => {
    expect(() => adaptInventoryList(list)).toThrow(InventoryShapeError);
  });
});
