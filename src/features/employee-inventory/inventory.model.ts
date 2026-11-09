export type InventoryItemType = 'COUPLE_TSHIRT' | 'GINSENG_GIFT' | 'GOLF_BALL' | 'SCARF';

/** 고정 품목 하나의 현재 총 재고 (Backend 값 그대로). */
export interface InventoryItem {
  itemType: InventoryItemType;
  quantity: number;
}
