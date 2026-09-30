import { ImageReveal } from '@/shared/motion';
import { ImageFrame, TextLink } from '@/shared/ui';

import type { ThemeDiscoveryPresentation } from '@/features/tour-discovery';
import styles from '@/features/tour-discovery/ThemeEditorialCard.module.css';

interface ThemeEditorialCardProps {
  href: string;
  presentation: ThemeDiscoveryPresentation;
  sequence: number;
}

const themeClassNames: Record<ThemeDiscoveryPresentation['theme'], string> = {
  HONEYMOON_ROMANCE: styles.honeymoon ?? '',
  PARENTS_HEALING: styles.parents ?? '',
  GOLF_CHALLENGE: styles.golf ?? '',
  OUTDOOR_TREKKING: styles.trekking ?? '',
};

/**
 * Theme의 emotional preview를 담당하는 Home 전용 domain component다.
 *
 * CONTRACT: href는 Page/App navigation layer가 주입한다.
 * 이 Feature는 Theme를 TourProduct id로 변환하거나 Router contract를 소유하지 않는다.
 */
export function ThemeEditorialCard({ href, presentation, sequence }: ThemeEditorialCardProps) {
  return (
    <article className={[styles.root, themeClassNames[presentation.theme]].join(' ')}>
      <ImageReveal className={styles.mediaReveal ?? ''}>
        <div className={styles.mediaShell}>
          <ImageFrame
            alt={presentation.media.imageAlt}
            aspectRatio="4 / 5"
            fallback={<span className={styles.fallback}>{presentation.media.fallbackLabel}</span>}
            radius="xl"
            {...(presentation.media.imageSrc !== null ? { src: presentation.media.imageSrc } : {})}
          />
          <span aria-hidden="true" className={styles.mediaMark}>
            {String(sequence).padStart(2, '0')}
          </span>
        </div>
      </ImageReveal>

      <div className={styles.copy}>
        <p className={styles.sequence}>Theme {String(sequence).padStart(2, '0')}</p>
        <h3>{presentation.title}</h3>
        <p className={styles.positioning}>{presentation.positioningLine}</p>
        <TextLink
          aria-label={`Explore ${presentation.title} theme tours`}
          className={styles.action ?? ''}
          to={href}
        >
          Explore
          <span aria-hidden="true">→</span>
        </TextLink>
      </div>
    </article>
  );
}
