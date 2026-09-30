import { ImageReveal, SectionReveal } from '@/shared/motion';
import { ImageFrame, PageContainer } from '@/shared/ui';

import type { TourDetailModel } from '@/features/tour-detail/tourDetail.model';

import styles from '@/features/tour-detail/IncludedExperienceSection.module.css';

interface IncludedExperienceSectionProps {
  tour: TourDetailModel;
}

export function IncludedExperienceSection({ tour }: IncludedExperienceSectionProps) {
  return (
    <section aria-labelledby="included-experience-title" className={styles.root}>
      <PageContainer variant="wide">
        <SectionReveal className={styles.heading ?? ''}>
          <p className={styles.eyebrow}>Included experience</p>
          <h2 id="included-experience-title">What this Theme brings with it.</h2>
          <p>
            These are the approved included offerings for {tour.themeLabel}. Product destination,
            dates, hotel and price are intentionally kept separate.
          </p>
        </SectionReveal>

        <div className={styles.grid}>
          {tour.includedExperiences.map((experience, index) => (
            <SectionReveal className={styles.item ?? ''} key={experience.key}>
              <ImageReveal className={styles.mediaReveal ?? ''}>
                <ImageFrame
                  alt={experience.media.imageAlt}
                  aspectRatio="4 / 3"
                  className={styles.mediaFrame ?? ''}
                  fallback={
                    <span className={styles.fallback}>{experience.media.fallbackLabel}</span>
                  }
                  radius="lg"
                  {...(experience.media.imageSrc !== null
                    ? { src: experience.media.imageSrc }
                    : {})}
                />
              </ImageReveal>
              <p className={styles.sequence}>{String(index + 1).padStart(2, '0')}</p>
              <h3>{experience.title}</h3>
              <p className={styles.description}>{experience.description}</p>
            </SectionReveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
