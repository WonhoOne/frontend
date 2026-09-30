import {
  TOUR_THEME_ORDER,
  themeDiscoveryPresentations,
} from '@/features/tour-discovery/themeDiscoveryPresentations';
import type {
  ThemeDiscoveryGroupModel,
  TourProductSummaryModel,
  TourTheme,
} from '@/features/tour-discovery/tourDiscovery.model';

function isTourTheme(value: string): value is TourTheme {
  return TOUR_THEME_ORDER.some((theme) => theme === value);
}

/**
 * Theme presentation과 TourProduct collection을 결합한다.
 *
 * CONTRACT: Theme 1:N TourProduct를 그대로 표현한다.
 * Theme마다 product가 정확히 하나라고 가정하지 않으며 0개도 보존한다.
 */
export function groupTourProductsByTheme(
  products: readonly TourProductSummaryModel[],
): readonly ThemeDiscoveryGroupModel[] {
  return themeDiscoveryPresentations.map((presentation) => ({
    presentation,
    products: products.filter((product) => product.theme === presentation.theme),
  }));
}

/**
 * Tours route의 Frontend-local Theme focus 값을 안전하게 읽는다.
 *
 * CONTRACT: `theme` query는 Backend API query가 아니다.
 * 모르는 값은 무시하고 전체 collection을 보여줄 수 있도록 null을 반환한다.
 */
export function readThemeFromSearchParams(searchParams: URLSearchParams): TourTheme | null {
  const theme = searchParams.get('theme');

  return theme !== null && isTourTheme(theme) ? theme : null;
}
