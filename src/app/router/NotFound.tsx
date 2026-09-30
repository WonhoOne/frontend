import { routePaths, routeTitles } from '@/app/router/paths';
import { PageShell } from '@/app/shell/PageShell';
import { TextLink } from '@/shared/ui';

import styles from '@/app/router/NotFound.module.css';

export function NotFound() {
  return (
    <PageShell containerVariant="reading" eyebrow="404" title={routeTitles.notFound}>
      <p className={styles.message}>The requested route is not part of the Customer application.</p>
      <nav aria-label="Not found recovery" className={styles.actions}>
        <TextLink to={routePaths.home}>Home</TextLink>
        <TextLink to={routePaths.tours}>Tours</TextLink>
      </nav>
    </PageShell>
  );
}
