import type { TourStyle, TourTheme } from '@/features/tour-discovery';

export type { TourStyle, TourTheme };

/** 직원 화면에서 다루는 여행상품. Backend 응답을 adapter가 옮긴 Frontend model이다. */
export interface EmployeeTourProduct {
  /** Backend 양의 정수 id의 canonical 문자열 (route/key 용) */
  id: string;
  theme: TourTheme;
  name: string;
  description: string;
  /** Classic → Grand → Premium 순서로 정렬된 1인 가격 (원) */
  stylePrices: ReadonlyArray<{ style: TourStyle; amount: number }>;
}

/**
 * 생성/수정 폼의 입력 값이다.
 *
 * WHY: 가격은 사용자가 입력 중인 문자열 그대로 보관한다. Theme을 바꿔도 숨겨진
 * Style의 가격을 지우지 않고 기억했다가 되돌리면 복원한다 (CP5 §3.6).
 */
export interface ProductFormValues {
  theme: TourTheme | '';
  name: string;
  description: string;
  prices: Readonly<Record<TourStyle, string>>;
}

/** 검증을 통과해 Backend로 보낼 수 있는 값이다 (currency는 DataSource가 붙인다). */
export interface TourProductWriteInput {
  theme: TourTheme;
  name: string;
  description: string;
  stylePrices: ReadonlyArray<{ style: TourStyle; amount: number }>;
}

export type ProductFormField = 'theme' | 'name' | 'description' | `price.${TourStyle}`;

export type ProductFormErrors = Partial<Record<ProductFormField | 'stylePrices', string>>;
