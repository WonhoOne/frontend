import { PageShell } from '@/app/shell/PageShell';

import styles from '@/app/router/RoutePlaceholder.module.css';

interface RoutePlaceholderProps {
  title: string;
  routeName: string;
  matchedParam?: {
    label: string;
    value: string | undefined;
  };
}

/**
 * Product Page가 들어오기 전 route runtime과 PageShell을 검증하는 임시 surface다.
 *
 * LIFECYCLE: 이후 Product Page PR이 이 placeholder를 대체한다.
 * 여기에는 가짜 Product data나 business behavior를 추가하지 않는다.
 */
export function RoutePlaceholder({ matchedParam, routeName, title }: RoutePlaceholderProps) {
  return (
    <PageShell eyebrow="App runtime route" title={title}>
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
      <p className={styles.status}>Runtime placeholder. Product UI is not implemented here.</p>
    </PageShell>
  );
}
