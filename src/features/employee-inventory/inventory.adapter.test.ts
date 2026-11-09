import { describe, expect, it } from 'vitest';

import {
  adaptInventoryList,
  InventoryShapeError,
} from '@/features/employee-inventory/inventory.adapter';
import type { InventoryDto } from '@/integrations/backend/contracts';

const four: readonly InventoryDto[] = [
  { id: 1, itemType: 'COUPLE_TSHIRT', quantity: 12 },
  { id: 2, itemType: 'GINSENG_GIFT', quantity: 0 },
  { id: 3, itemType: 'GOLF_BALL', quantity: 35 },
  { id: 4, itemType: 'SCARF', quantity: 8 },
];

describe('adaptInventoryList', () => {
  it('keeps Backend order and drops ids', () => {
    expect(adaptInventoryList(four).map(({ itemType }) => itemType)).toEqual([
      'COUPLE_TSHIRT',
      'GINSENG_GIFT',
      'GOLF_BALL',
      'SCARF',
    ]);
  });

  const invalidLists: ReadonlyArray<readonly InventoryDto[]> = [
    [],
    four.slice(0, 3),
    [...four.slice(0, 3), { id: 5, itemType: 'GOLF_BALL', quantity: 1 }],
  ];

  it.each(invalidLists.map((list) => [list]))(
    'refuses anything other than each fixed item exactly once',
    (list) => {
      expect(() => adaptInventoryList(list)).toThrow(InventoryShapeError);
    },
  );
});
