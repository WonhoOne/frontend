import type { ReactNode } from 'react';

import styles from '@/app/state/StatePresentation.module.css';

interface OfflineBannerProps {
  children: ReactNode;
}

/**
 * 사용 가능한 cached content 위에 offline 상태를 별도로 표시하는 banner다.
 *
 * CONTRACT: mutation queue나 성공을 가장하지 않으며 offline 의미의 copy는 호출자가 제공한다.
 */
export function OfflineBanner({ children }: OfflineBannerProps) {
  return (
    <div aria-live="polite" className={styles.banner} role="status">
      {children}
    </div>
  );
}
