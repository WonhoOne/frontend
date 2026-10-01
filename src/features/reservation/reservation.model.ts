export type ReservationTheme =
  'HONEYMOON_ROMANCE' | 'PARENTS_HEALING' | 'GOLF_CHALLENGE' | 'OUTDOOR_TREKKING';

export type ReservationTourStyle = 'CLASSIC' | 'GRAND' | 'PREMIUM';
export type ReservationHotelOption = 'HOTEL_3_STAR' | 'HOTEL_4_STAR' | 'HOTEL_5_STAR';
export type ReservationTransportOption = 'PRIVATE_LUXURY_CAR_2' | 'PREMIUM_VAN_10';
export type ReservationMealOption = 'LUNCH_BOX' | 'LOCAL_RESTAURANT' | 'PREMIUM_RESTAURANT';
export type ReservationExtraOption = 'CHAMPAGNE' | 'COFFEE';
export type ReservationRecruitmentUnit = 'COUPLE_TEAM' | 'PARTICIPANT';

export interface ReservationConfigurationModel {
  style: ReservationTourStyle;
  hotelOption: ReservationHotelOption;
  transportOption: ReservationTransportOption;
  mealOption: ReservationMealOption;
  readonly extraOptions: readonly ReservationExtraOption[];
}

export interface ReservationRecruitmentModel {
  unit: ReservationRecruitmentUnit;
  currentCount: number;
  requiredCount: number;
  confirmed: boolean;
}

export interface ReservationDiscountModel {
  type: 'LOYALTY';
  ratePercent: 5;
  amount: number;
}

export interface ReservationPriceModel {
  unitPrice: number;
  subtotal: number;
  discount: ReservationDiscountModel | null;
  total: number;
  currency: 'KRW';
}

/**
 * Shared API v0.2의 Reservation representation을 Feature가 소비하는 server-truth model이다.
 *
 * CONTRACT:
 * - POST success와 GET detail은 이 동일한 의미를 가진다.
 * - Reservation lifecycle status는 v0.2에 없으므로 이 model에도 만들지 않는다.
 * - configuration/price는 Reservation 생성 시점 snapshot이고 recruitment는 Schedule의 current truth다.
 */
export interface ReservationModel {
  id: number;
  participantCount: number;
  tourProduct: {
    id: number;
    theme: ReservationTheme;
    name: string;
  };
  schedule: {
    id: number;
    startDate: string;
    endDate: string;
    recruitment: ReservationRecruitmentModel;
  };
  configuration: ReservationConfigurationModel;
  price: ReservationPriceModel;
}

export interface CreateReservationInput {
  scheduleId: number;
  participantCount: number;
  configuration: ReservationConfigurationModel;
}
