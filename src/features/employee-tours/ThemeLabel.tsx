import type { TourTheme } from '@/features/employee-tours/employeeTour.model';
import styles from '@/features/employee-tours/ThemeLabel.module.css';
import { tourThemeTitle } from '@/features/tour-discovery';

const dotClass: Readonly<Record<TourTheme, string | undefined>> = {
  HONEYMOON_ROMANCE: styles.honeymoon,
  PARENTS_HEALING: styles.parents,
  GOLF_CHALLENGE: styles.golf,
  OUTDOOR_TREKKING: styles.trekking,
};

/**
 * Theme 표시. 색 점은 장식이고 항상 Customer와 같은 Theme 이름 text가 함께 나온다
 * (CP2-B, CP9 A10: 색만으로 구분하지 않는다).
 */
export function ThemeLabel({ theme }: { theme: TourTheme }) {
  return (
    <span className={styles.root}>
      <span aria-hidden="true" className={`${styles.dot} ${dotClass[theme] ?? ''}`} />
      {tourThemeTitle(theme)}
    </span>
  );
}
