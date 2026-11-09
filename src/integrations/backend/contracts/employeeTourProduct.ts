import type { TourStyleDto, TourThemeDto } from '@/integrations/backend/contracts/tourProduct';

/**
 * `POST /api/v1/employee/tours`, `PUT /api/v1/employee/tours/{tourId}` request body (REST v0.2).
 *
 * CONTRACT: 응답 전용 필드(`id`, `availableStyles`)는 보내지 않는다. 응답은 공개
 * TourProduct와 같은 모양이라 `decodeTourProductDto`로 검증한다 (CP8 §3).
 */
export interface TourProductWriteRequestDto {
  theme: TourThemeDto;
  name: string;
  description: string;
  stylePrices: ReadonlyArray<{ style: TourStyleDto; amount: number; currency: 'KRW' }>;
}
