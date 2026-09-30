import { PageContainer } from '@/shared/ui';

import styles from '@/app/router/RoutePlaceholder.module.css';

interface RoutePlaceholderProps {
  screenName: string;
  routeName: string;
  matchedParam?: {
    label: string;
    value: string | undefined;
  };
}

/**
 * Temporary PR-01 route surface used to verify routing and App Shell wiring.
 *
 * LIFECYCLE: Product Page PRs replace these placeholders. They must not grow
 * fake Product data or business behavior.
 */
export function RoutePlaceholder({ matchedParam, routeName, screenName }: RoutePlaceholderProps) {
  return (
    <PageContainer>
      <section className={styles.root}>
        <p className={styles.eyebrow}>Foundation route</p>
        <h1>{screenName}</h1>
        <dl className={styles.details}>
          <div>
            <dt>Route</dt>
            <dd>{routeName}</dd>
          </div>
          {matchedParam !== undefined ? (
            <div>
              <dt>{matchedParam.label}</dt>
              <dd>{matchedParam.value ?? 'Missing route parameter'}</dd>
            </div>
          ) : null}
        </dl>
        <p className={styles.status}>Foundation placeholder. Product UI is not implemented here.</p>
      </section>
    </PageContainer>
  );
}
