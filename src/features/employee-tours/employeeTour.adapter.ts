import type {
  EmployeeTourProduct,
  TourProductWriteInput,
} from '@/features/employee-tours/employeeTour.model';
import { TOUR_STYLE_ORDER } from '@/features/employee-tours/productFormRules';
import type { TourProductDto, TourProductWriteRequestDto } from '@/integrations/backend/contracts';
import { toCanonicalBackendResourceIdentity } from '@/shared/lib/resourceIdentity';

/**
 * Backend TourProduct → 직원 화면 model.
 *
 * CONTRACT: `decodeTourProductDto`가 Theme/Style/가격 일관성과 KRW를 이미 검증했다.
 * `availableStyles`와 `currency`는 model에 담지 않는다 (CP8 §2).
 */
export function adaptEmployeeTourProduct(dto: TourProductDto): EmployeeTourProduct {
  const stylePrices = [...dto.stylePrices]
    .sort((a, b) => TOUR_STYLE_ORDER.indexOf(a.style) - TOUR_STYLE_ORDER.indexOf(b.style))
    .map(({ style, amount }) => ({ style, amount }));

  return {
    id: toCanonicalBackendResourceIdentity(dto.id),
    theme: dto.theme,
    name: dto.name,
    description: dto.description,
    stylePrices,
  };
}

/** 검증된 쓰기 입력 → REST v0.2 request body. */
export function toTourProductWriteRequestDto(
  input: TourProductWriteInput,
): TourProductWriteRequestDto {
  return {
    theme: input.theme,
    name: input.name,
    description: input.description,
    stylePrices: input.stylePrices.map(({ style, amount }) => ({
      style,
      amount,
      currency: 'KRW',
    })),
  };
}
