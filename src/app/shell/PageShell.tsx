import type { ReactNode } from 'react';

import { PageContainer, type PageContainerVariant } from '@/shared/ui';

import styles from '@/app/shell/PageShell.module.css';

interface PageShellProps {
  title: string;
  children?: ReactNode;
  eyebrow?: string;
  containerVariant?: PageContainerVariant;
}

/**
 * Route Page의 공통 heading과 content width를 구성하는 Application shell이다.
 *
 * CONTRACT: 각 Page는 하나의 route-level H1을 이 shell에 전달한다.
 * Product section 구조와 Feature-specific layout은 children이 소유한다.
 */
export function PageShell({ children, containerVariant = 'main', eyebrow, title }: PageShellProps) {
  return (
    <PageContainer variant={containerVariant}>
      <section className={styles.root}>
        <header className={styles.heading}>
          {eyebrow !== undefined ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1>{title}</h1>
        </header>

        {children !== undefined ? <div className={styles.content}>{children}</div> : null}
      </section>
    </PageContainer>
  );
}
