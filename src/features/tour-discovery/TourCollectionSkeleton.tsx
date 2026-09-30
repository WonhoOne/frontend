import { TOUR_THEME_ORDER } from '@/features/tour-discovery/themeDiscoveryPresentations';
import { Skeleton } from '@/shared/ui';

import styles from '@/features/tour-discovery/TourCollectionSkeleton.module.css';

/**
 * Tours의 Theme context + TourProduct card geometry를 유지하는 initial loading skeleton이다.
 *
 * ACCESSIBILITY: shape는 숨기고 상위 LoadingState가 loading 의미를 한 번만 전달한다.
 */
export function TourCollectionSkeleton() {
  return (
    <div className={styles.collection} data-testid="tour-collection-skeleton">
      {TOUR_THEME_ORDER.map((theme) => (
        <div className={styles.group} data-tour-skeleton-group key={theme}>
          <div className={styles.context}>
            <Skeleton className={styles.kicker ?? ''} variant="line" />
            <Skeleton className={styles.heading ?? ''} variant="line" />
            <Skeleton className={styles.copy ?? ''} variant="line" />
            <Skeleton className={styles.copyShort ?? ''} variant="line" />
          </div>

          <div className={styles.products}>
            <div className={styles.card}>
              <Skeleton className={styles.media ?? ''} variant="block" />
              <div className={styles.cardBody}>
                <Skeleton className={styles.cardLabel ?? ''} variant="line" />
                <Skeleton className={styles.cardHeading ?? ''} variant="line" />
                <Skeleton className={styles.cardCopy ?? ''} variant="line" />
                <Skeleton className={styles.cardAction ?? ''} variant="line" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
