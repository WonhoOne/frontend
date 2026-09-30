import { ImageReveal, SectionReveal } from '@/shared/motion';
import { ImageFrame, PageContainer } from '@/shared/ui';

import type { TourDetailModel } from '@/features/tour-detail/tourDetail.model';

import styles from '@/features/tour-detail/TourDetailStory.module.css';

interface TourDetailStoryProps {
  tour: TourDetailModel;
}

export function TourDetailStory({ tour }: TourDetailStoryProps) {
  return (
    <section aria-labelledby="tour-story-title" className={styles.root}>
      <PageContainer className={styles.layout ?? ''} variant="wide">
        <SectionReveal className={styles.copy ?? ''}>
          <p className={styles.eyebrow}>The story</p>
          <h2 id="tour-story-title">{tour.storyTitle}</h2>
          <p className={styles.body}>{tour.storyBody}</p>
        </SectionReveal>

        <ImageReveal className={styles.mediaReveal ?? ''}>
          <ImageFrame
            alt={tour.storyMedia.imageAlt}
            aspectRatio="4 / 3"
            className={styles.mediaFrame ?? ''}
            fallback={<span className={styles.fallback}>{tour.storyMedia.fallbackLabel}</span>}
            radius="xl"
            {...(tour.storyMedia.imageSrc !== null ? { src: tour.storyMedia.imageSrc } : {})}
          />
        </ImageReveal>
      </PageContainer>
    </section>
  );
}
