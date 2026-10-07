import type { PriceDisplayModel } from '@/features/configuration/configurationModels';
import type {
  TourDetailStyle,
  TourDetailStylePriceModel,
} from '@/features/tour-detail/tourDetail.model';

function formatKrw(amount: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildPublicConfigurePrice({
  participantCount,
  selectedStyle,
  stylePrices,
}: {
  participantCount: number | null;
  selectedStyle: TourDetailStyle | null;
  stylePrices: readonly TourDetailStylePriceModel[];
}): PriceDisplayModel {
  if (selectedStyle === null) {
    return {
      state: 'unavailable',
      message: 'Choose a style to see the current public price.',
    };
  }

  const selectedPrice = stylePrices.find((price) => price.style === selectedStyle);

  if (selectedPrice === undefined) {
    return {
      state: 'unavailable',
      message: 'The selected style price is unavailable.',
    };
  }

  if (participantCount === null) {
    return {
      state: 'known',
      totalLabel: `${formatKrw(selectedPrice.amount)} per participant`,
    };
  }

  return {
    state: 'known',
    totalLabel: `Estimated subtotal ${formatKrw(selectedPrice.amount * participantCount)} · ${formatKrw(selectedPrice.amount)} per participant`,
  };
}
