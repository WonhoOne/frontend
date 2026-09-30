import { TourCollectionCard } from '@/features/tour-discovery/TourCollectionCard';
import type {
  ThemeDiscoveryGroupModel,
  TourProductSummaryModel,
} from '@/features/tour-discovery/tourDiscovery.model';

import styles from '@/features/tour-discovery/TourThemeGroup.module.css';

interface TourThemeGroupProps {
  focused: boolean;
  getProductHref: (product: TourProductSummaryModel) => string;
  group: ThemeDiscoveryGroupModel;
}

/**
 * Theme는 discovery context만 소유하고, detail navigation은 내부 TourProduct가 소유한다.
 *
 * CONTRACT: Feature는 App Router를 import하지 않는다.
 * Product href composition은 Page/App boundary가 주입한다.
 */
export function TourThemeGroup({ focused, getProductHref, group }: TourThemeGroupProps) {
  const { presentation, products } = group;
  const headingId = `theme-${presentation.theme.toLowerCase().replaceAll('_', '-')}`;

  return (
    <section
      aria-labelledby={headingId}
      className={styles.root}
      data-focused-theme={focused ? 'true' : 'false'}
      data-theme={presentation.theme}
    >
      <div className={styles.context}>
        <div className={styles.headingLine}>
          <p className={styles.kicker}>Theme</p>
          {focused ? <span className={styles.focusedLabel}>Your selected theme</span> : null}
        </div>
        <h2 id={headingId}>{presentation.title}</h2>
        <p className={styles.positioning}>{presentation.positioningLine}</p>
        <ul className={styles.highlights}>
          {presentation.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>

      <div className={styles.products}>
        {products.map((product) => (
          <TourCollectionCard
            href={getProductHref(product)}
            key={product.id}
            product={product}
            theme={presentation}
          />
        ))}
      </div>
    </section>
  );
}
