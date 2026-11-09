import type { InventoryItemType } from '@/features/employee-inventory/inventory.model';

/**
 * 화면 표시 이름. 공통 Product Catalog의 기념품 문구를 따른다 (CP6-0 §2).
 * WHY: Backend는 enum만 주므로 표시 이름은 Frontend가 소유한다.
 */
const ITEM_LABELS: Readonly<Record<InventoryItemType, string>> = {
  COUPLE_TSHIRT: '커플 기념 티셔츠',
  GINSENG_GIFT: '건강 인삼 기념품',
  GOLF_BALL: '골프공',
  SCARF: '아웃도어 기념품 스카프',
};

export const INVENTORY_ITEM_ORDER = [
  'COUPLE_TSHIRT',
  'GINSENG_GIFT',
  'GOLF_BALL',
  'SCARF',
] as const satisfies readonly InventoryItemType[];

export function inventoryItemLabel(itemType: InventoryItemType): string {
  return ITEM_LABELS[itemType];
}

const quantityFormatter = new Intl.NumberFormat('ko-KR');

export function formatQuantity(quantity: number): string {
  return `${quantityFormatter.format(quantity)}개`;
}

export type StockQuantityCheck = { ok: true; quantity: number } | { ok: false; message: string };

/**
 * 추가할 수량을 검증한다 (E05 §10).
 *
 * CONTRACT: 양의 정수 delta만 보낸다. 상한은 business 규칙이 아니라 JS가 결과 총량을
 * 정확히 표현할 수 있는 기술적 한계다 (CP8 §4).
 */
export function checkStockQuantity(raw: string, currentQuantity: number): StockQuantityCheck {
  const value = raw.replace(/[\s,개]/g, '');

  if (value === '') {
    return { ok: false, message: '추가할 수량을 입력해 주세요.' };
  }

  if (!/^-?\d+$/.test(value)) {
    return { ok: false, message: '정수로 입력해 주세요.' };
  }

  const quantity = Number(value);

  if (quantity < 1) {
    return { ok: false, message: '1개 이상 입력해 주세요.' };
  }

  if (!Number.isSafeInteger(quantity) || !Number.isSafeInteger(currentQuantity + quantity)) {
    return { ok: false, message: '수량이 너무 큽니다.' };
  }

  return { ok: true, quantity };
}
