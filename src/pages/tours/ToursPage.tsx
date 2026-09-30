import { useSearchParams } from 'react-router';

import { routeBuilders, routePaths } from '@/app/router/paths';
import {
  groupTourProductsByTheme,
  readThemeFromSearchParams,
  TourStyleExplainer,
  TourThemeGroup,
  ToursIntro,
  tourDiscoveryPreviewProducts,
} from '@/features/tour-discovery';
import { SectionReveal } from '@/shared/motion';
import { PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/tours/ToursPage.module.css';

const footerNavigation = [
  { label: 'Home', to: routePaths.home },
  { label: 'My Trips', to: routePaths.myTrips },
  { label: 'Login / Account', to: routePaths.login },
] as const;

export function ToursPage() {
  const [searchParams] = useSearchParams();
  const focusedTheme = readThemeFromSearchParams(searchParams);
  const groups = groupTourProductsByTheme(tourDiscoveryPreviewProducts);

  return (
    <div className={styles.page}>
      <PageContainer className={styles.content ?? ''} variant="main">
        <SectionReveal>
          <ToursIntro />
        </SectionReveal>

        <div className={styles.collection}>
          {groups.map((group) => (
            <SectionReveal key={group.presentation.theme}>
              <TourThemeGroup
                focused={focusedTheme === group.presentation.theme}
                getProductHref={(product) => routeBuilders.tourDetail(product.id)}
                group={group}
              />
            </SectionReveal>
          ))}
        </div>

        <SectionReveal>
          <TourStyleExplainer />
        </SectionReveal>
      </PageContainer>

      <footer className={styles.footer}>
        <PageContainer className={styles.footerInner ?? ''} variant="main">
          <div>
            <p className={styles.footerBrand}>Mister World</p>
            <p className={styles.footerNote}>Choose a Theme. Then choose the journey within it.</p>
          </div>
          <nav aria-label="Footer">
            {footerNavigation.map((item) => (
              <TextLink key={item.to} to={item.to}>
                {item.label}
              </TextLink>
            ))}
          </nav>
        </PageContainer>
      </footer>
    </div>
  );
}
