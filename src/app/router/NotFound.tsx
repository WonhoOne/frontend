import { routePaths } from '@/app/router/paths';
import { PageContainer, TextLink } from '@/shared/ui';

import styles from '@/app/router/NotFound.module.css';

export function NotFound() {
  return (
    <PageContainer variant="reading">
      <section className={styles.root}>
        <p className={styles.eyebrow}>404</p>
        <h1>Page not found</h1>
        <p>The requested route is not part of the Customer application.</p>
        <nav aria-label="Not found recovery" className={styles.actions}>
          <TextLink to={routePaths.home}>Home</TextLink>
          <TextLink to={routePaths.tours}>Tours</TextLink>
        </nav>
      </section>
    </PageContainer>
  );
}
