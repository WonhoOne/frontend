import { TextLink } from '@/shared/ui';

import styles from '@/features/tour-discovery/HomeHero.module.css';

interface HomeHeroProps {
  toursHref: string;
}

/**
 * Home의 brand-first entry surface다.
 *
 * CONTRACT: Hero copy와 visual treatment는 Frontend-owned editorial presentation이며
 * Backend product field나 Auth state를 추론하지 않는다.
 */
export function HomeHero({ toursHref }: HomeHeroProps) {
  return (
    <section aria-labelledby="home-hero-title" className={styles.root} data-home-hero>
      <div aria-hidden="true" className={styles.visual} data-home-hero-visual>
        <span className={styles.orbit} />
        <span className={styles.horizon} />
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow} data-home-hero-copy="eyebrow">
          Mister World · Curated Journeys
        </p>
        <h1 data-home-hero-copy="headline" id="home-hero-title">
          A journey made <br />
          for your moment.
        </h1>
        <p className={styles.supporting} data-home-hero-copy="supporting">
          Four distinct ways to travel, shaped around the people and moments that matter most.
        </p>
        <TextLink
          className={styles.primaryAction ?? ''}
          data-home-hero-copy="action"
          to={toursHref}
        >
          Explore Theme Tours
          <span aria-hidden="true">↗</span>
        </TextLink>
      </div>

      <p aria-hidden="true" className={styles.scrollCue}>
        Discover
        <span>↓</span>
      </p>
    </section>
  );
}
