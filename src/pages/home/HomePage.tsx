import { routeBuilders, routePaths } from '@/app/router/paths';
import {
  CustomizationPromise,
  HomeHero,
  ThemeEditorialCard,
  themeDiscoveryPresentations,
} from '@/features/tour-discovery';
import { SectionReveal } from '@/shared/motion';
import { PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/home/HomePage.module.css';

const footerNavigation = [
  { label: 'Tours', to: routePaths.tours },
  { label: 'My Trips', to: routePaths.myTrips },
  { label: 'Login / Account', to: routePaths.login },
] as const;

export function HomePage() {
  return (
    <div className={styles.page}>
      <HomeHero toursHref={routePaths.tours} />

      <PageContainer className={styles.content ?? ''} variant="wide">
        <SectionReveal>
          <section aria-labelledby="theme-collection-title" className={styles.intro}>
            <p className={styles.eyebrow}>Four ways to travel differently</p>
            <h2 id="theme-collection-title">Find the journey that feels like yours.</h2>
            <p>
              Mister World begins with four distinct travel themes. Each one sets a different
              rhythm, while leaving room for the details to become your own.
            </p>
          </section>
        </SectionReveal>

        <section aria-label="Theme tours" className={styles.themeGrid}>
          {themeDiscoveryPresentations.map((presentation, index) => (
            <SectionReveal key={presentation.theme}>
              <ThemeEditorialCard
                href={routeBuilders.toursByTheme(presentation.theme)}
                presentation={presentation}
                sequence={index + 1}
              />
            </SectionReveal>
          ))}
        </section>

        <SectionReveal>
          <CustomizationPromise toursHref={routePaths.tours} />
        </SectionReveal>
      </PageContainer>

      <footer className={styles.footer}>
        <PageContainer className={styles.footerInner ?? ''} variant="wide">
          <div>
            <p className={styles.footerBrand}>Mister World</p>
            <p className={styles.footerNote}>Curated journeys for meaningful moments.</p>
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
