import type { ReactNode } from 'react';

import styles from '@/app/state/StatePresentation.module.css';

interface LoadingStateProps {
  label: string;
  children: ReactNode;
}

/**
 * 초기 loading 구간의 접근성 semantics를 제공하고 layout skeleton은 호출자에게 맡긴다.
 *
 * CONTRACT: full-page spinner나 Product copy를 만들지 않는다.
 * 실제 geometry는 호출자가 Skeleton primitive를 조합해 유지한다.
 */
export function LoadingState({ children, label }: LoadingStateProps) {
  return (
    <section aria-busy="true" aria-label={label} className={styles.loading}>
      <span className={styles.visuallyHidden}>{label}</span>
      {children}
    </section>
  );
}
