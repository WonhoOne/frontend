import { describe, expect, it } from 'vitest';

import {
  checkStockQuantity,
  formatQuantity,
  inventoryItemLabel,
} from '@/features/employee-inventory/stockAddRules';

describe('stock add rules', () => {
  it('accepts a positive integer delta, tolerating separators and the unit', () => {
    expect(checkStockQuantity('5', 35)).toEqual({ ok: true, quantity: 5 });
    expect(checkStockQuantity(' 1,000개 ', 0)).toEqual({ ok: true, quantity: 1000 });
  });

  it.each([
    ['', '추가할 수량을 입력해 주세요.'],
    ['0', '1개 이상 입력해 주세요.'],
    ['-3', '1개 이상 입력해 주세요.'],
    ['2.5', '정수로 입력해 주세요.'],
    ['다섯', '정수로 입력해 주세요.'],
    ['9007199254740991', '수량이 너무 큽니다.'],
  ])('rejects %j', (raw, message) => {
    expect(checkStockQuantity(raw, 1)).toEqual({ ok: false, message });
  });

  it('uses the shared catalog wording and a Korean unit', () => {
    expect(inventoryItemLabel('GINSENG_GIFT')).toBe('건강 인삼 기념품');
    expect(inventoryItemLabel('SCARF')).toBe('아웃도어 기념품 스카프');
    expect(formatQuantity(1200)).toBe('1,200개');
    expect(formatQuantity(0)).toBe('0개');
  });
});
