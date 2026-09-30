import type { PriceDisplayModel } from '@/features/configuration/configurationModels';

/**
 * Mobile compact surface에서도 상세 PriceSummary와 같은 display-state semantics를 사용한다.
 * 숫자 계산 없이 caller가 제공한 label만 축약해 표현한다.
 */
export function getCompactPriceLabel(price: PriceDisplayModel) {
  switch (price.state) {
    case 'known':
      return price.totalLabel;
    case 'loading':
      return price.previousTotalLabel === null
        ? 'Price loading'
        : `${price.previousTotalLabel} · Checking`;
    case 'recalculating':
      return `${price.previousTotalLabel} · Updating`;
    case 'error':
      return price.previousTotalLabel ?? 'Price unavailable';
    case 'unavailable':
      return 'Price unavailable';
  }
}
