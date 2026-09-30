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
 * PR-01에서 routing과 App Shell 연결을 검증하기 위한 임시 route surface다.
 *
 * LIFECYCLE: 이후 Product Page PR이 이 placeholder를 대체한다.
 * 여기에는 가짜 Product data나 business behavior를 추가하지 않는다.
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
