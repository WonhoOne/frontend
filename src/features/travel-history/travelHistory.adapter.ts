import type { TravelHistoryItemModel } from '@/features/travel-history/travelHistory.model';
import type { TravelHistoryItemDto } from '@/integrations/backend/contracts';

/** Preserve Backend eligibility, ordering and snapshot values without deriving new fields. */
export function adaptTravelHistoryListDto(
  items: readonly TravelHistoryItemDto[],
): readonly TravelHistoryItemModel[] {
  return items.map((item) => ({
    reservationId: item.reservationId,
    tourProduct: {
      id: item.tourProduct.id,
      theme: item.tourProduct.theme,
      name: item.tourProduct.name,
    },
    startDate: item.startDate,
    endDate: item.endDate,
    style: item.style,
    price: {
      amount: item.price.amount,
      currency: item.price.currency,
    },
  }));
}
