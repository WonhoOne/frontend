import { PageContainer, Skeleton } from '@/shared/ui';

import styles from '@/features/tour-detail/TourDetailSkeleton.module.css';

export function TourDetailSkeleton() {
  return (
    <div className={styles.root} data-testid="tour-detail-skeleton">
      <div className={styles.hero}>
        <PageContainer className={styles.heroCopy ?? ''} variant="wide">
          <Skeleton className={styles.eyebrow ?? ''} variant="line" />
          <Skeleton className={styles.title ?? ''} variant="line" />
          <Skeleton className={styles.summary ?? ''} variant="line" />
        </PageContainer>
      </div>

      <PageContainer className={styles.story ?? ''} variant="wide">
        <div className={styles.storyCopy}>
          <Skeleton className={styles.storyHeading ?? ''} variant="line" />
          <Skeleton className={styles.storyLine ?? ''} variant="line" />
          <Skeleton className={styles.storyLineShort ?? ''} variant="line" />
        </div>
        <Skeleton className={styles.storyMedia ?? ''} />
      </PageContainer>

      <PageContainer className={styles.experiences ?? ''} variant="wide">
        <Skeleton className={styles.sectionHeading ?? ''} variant="line" />
        <div className={styles.cards}>
          {[0, 1, 2].map((item) => (
            <div className={styles.card} key={item}>
              <Skeleton className={styles.cardMedia ?? ''} />
              <Skeleton className={styles.cardTitle ?? ''} variant="line" />
              <Skeleton className={styles.cardLine ?? ''} variant="line" />
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
