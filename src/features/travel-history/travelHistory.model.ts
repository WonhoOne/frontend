import type { TourStyle, TourTheme } from '@/features/tour-discovery';

export interface TravelHistoryPriceModel {
  amount: number;
  currency: string;
}

export interface TravelHistoryTourProductModel {
  id: number;
  theme: TourTheme;
  name: string;
}

/**
 * Frontend model intentionally mirrors only the fields guaranteed by Shared
 * Contract v0.2. Eligibility and ordering are Backend-owned.
 */
export interface TravelHistoryItemModel {
  reservationId: number;
  tourProduct: TravelHistoryTourProductModel;
  startDate: string;
  endDate: string;
  style: TourStyle;
  price: TravelHistoryPriceModel;
}
