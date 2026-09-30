import { ImageReveal } from '@/shared/motion';
import { ImageFrame, PageContainer, TextLink } from '@/shared/ui';

import type { TourDetailModel } from '@/features/tour-detail/tourDetail.model';

import styles from '@/features/tour-detail/TourDetailHero.module.css';

interface TourDetailHeroProps {
  backHref: string;
  tour: TourDetailModel;
}

export function TourDetailHero({ backHref, tour }: TourDetailHeroProps) {
  return (
    <section aria-labelledby="tour-title" className={styles.root} data-theme={tour.theme}>
      <ImageReveal className={styles.mediaReveal ?? ''}>
        <div className={styles.mediaShell}>
          <ImageFrame
            alt={tour.heroMedia.imageAlt}
            aspectRatio="16 / 9"
            className={styles.mediaFrame ?? ''}
            fallback={<span className={styles.fallback}>{tour.heroMedia.fallbackLabel}</span>}
            loading="eager"
            radius="none"
            {...(tour.heroMedia.imageSrc !== null ? { src: tour.heroMedia.imageSrc } : {})}
          />
        </div>
      </ImageReveal>

      <div aria-hidden="true" className={styles.overlay} />

      <PageContainer className={styles.content ?? ''} variant="wide">
        <p className={styles.eyebrow}>{tour.themeLabel}</p>
        <h1 id="tour-title">{tour.name}</h1>
        <p className={styles.summary}>{tour.summary}</p>
        <TextLink className={styles.backLink ?? ''} to={backHref}>
          ← Back to {tour.themeLabel} journeys
        </TextLink>
      </PageContainer>
    </section>
  );
}
