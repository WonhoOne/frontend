import { useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router';

import type {
  ThemeDiscoveryPresentation,
  TourProductSummaryModel,
  TourStyle,
} from '@/features/tour-discovery/tourDiscovery.model';
import { ImageReveal } from '@/shared/motion';
import { ImageFrame } from '@/shared/ui';

import styles from '@/features/tour-discovery/TourCollectionCard.module.css';

interface TourCollectionCardProps {
  href: string;
  product: TourProductSummaryModel;
  theme: ThemeDiscoveryPresentation;
}

const styleLabels: Record<TourStyle, string> = {
  CLASSIC: 'Classic',
  GRAND: 'Grand',
  PREMIUM: 'Premium',
};

const themeClassNames: Record<TourProductSummaryModel['theme'], string> = {
  HONEYMOON_ROMANCE: styles.honeymoon ?? '',
  PARENTS_HEALING: styles.parents ?? '',
  GOLF_CHALLENGE: styles.golf ?? '',
  OUTDOOR_TREKKING: styles.trekking ?? '',
};

function formatStyles(styles: readonly TourStyle[]) {
  return styles.map((style) => styleLabels[style]).join(' · ');
}

function isSingleWindowNavigation(event: ReactMouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * 실제 detail navigation 단위인 TourProduct 하나를 표현한다.
 *
 * CONTRACT:
 * - href는 TourProduct identity로 만들어진 /tours/:tourId여야 한다.
 * - Theme 값 자체를 route identity로 바꾸지 않는다.
 * - price/schedule/destination 같은 gated product truth를 표시하지 않는다.
 */
export function TourCollectionCard({ href, product, theme }: TourCollectionCardProps) {
  const navigationRequested = useRef(false);

  return (
    <Link
      aria-label={`View ${product.name} tour details`}
      className={[styles.root, themeClassNames[product.theme]].join(' ')}
      onClick={(event) => {
        if (!isSingleWindowNavigation(event)) {
          return;
        }

        // EDGE CASE: double click/tap이 같은 detail route를 history에 두 번 쌓지 않게 한다.
        if (navigationRequested.current) {
          event.preventDefault();
          return;
        }

        navigationRequested.current = true;
      }}
      to={href}
    >
      <ImageReveal className={styles.mediaReveal ?? ''}>
        <div className={styles.mediaShell}>
          <ImageFrame
            alt={product.media.imageAlt}
            aspectRatio="4 / 3"
            fallback={<span className={styles.fallback}>{product.media.fallbackLabel}</span>}
            radius="lg"
            {...(product.media.imageSrc !== null ? { src: product.media.imageSrc } : {})}
          />
          <span aria-hidden="true" className={styles.mediaLabel}>
            TourProduct
          </span>
        </div>
      </ImageReveal>

      <div className={styles.body}>
        <p className={styles.themeLabel}>{theme.title}</p>
        <h3>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <p className={styles.styles}>
          <span>Available styles</span>
          <strong>{formatStyles(product.availableStyles)}</strong>
        </p>
        <span aria-hidden="true" className={styles.action}>
          View Tour
          <span className={styles.arrow}>→</span>
        </span>
      </div>
    </Link>
  );
}
