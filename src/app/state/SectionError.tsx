import type { ReactNode } from 'react';

import { Button } from '@/shared/ui';

import styles from '@/app/state/StatePresentation.module.css';

interface SectionErrorProps {
  title: string;
  children: ReactNode;
  retryLabel: string;
  retryingLabel: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

/**
 * Data section 실패를 Page 전체 실패로 확대하지 않는 local recovery surface다.
 *
 * CONTRACT: 오류 copy와 retry 가능 여부는 호출자가 결정한다.
 * Backend raw message나 automatic mutation retry 의미는 이 Component가 만들지 않는다.
 */
export function SectionError({
  children,
  isRetrying = false,
  onRetry,
  retryLabel,
  retryingLabel,
  title,
}: SectionErrorProps) {
  return (
    <section aria-live="polite" className={styles.panel}>
      <div className={styles.copy}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.body}>{children}</div>
      </div>
      <Button
        isLoading={isRetrying}
        loadingLabel={retryingLabel}
        onClick={onRetry}
        variant="secondary"
      >
        {retryLabel}
      </Button>
    </section>
  );
}
