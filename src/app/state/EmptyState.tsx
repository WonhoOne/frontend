import type { ReactNode } from 'react';

import styles from '@/app/state/StatePresentation.module.css';

interface EmptyStateProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

/**
 * 정상 응답이지만 표시할 항목이 없는 상태를 Error와 분리해 표현한다.
 *
 * CONTRACT: Empty의 의미와 CTA는 Feature가 소유하며 이 Component는 배치만 제공한다.
 */
export function EmptyState({ action, children, title }: EmptyStateProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.copy}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.body}>{children}</div>
      </div>
      {action !== undefined ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}
