import type { ReactNode } from 'react';

import { TextLink } from '@/shared/ui';
import { routePaths } from '@/app/router/paths';

import styles from '@/app/shell/TransactionHeader.module.css';

interface TransactionHeaderProps {
  title: string;
  backAction?: ReactNode;
}

/**
 * Configuration/Reservation route를 위한 최소 application chrome이다.
 *
 * CONTRACT: Feature 상태와 navigation 결정은 호출자가 주입한다.
 * Header 자체가 Reservation 또는 Configuration data를 조회하지 않는다.
 */
export function TransactionHeader({ backAction, title }: TransactionHeaderProps) {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.leading}>
          {backAction !== undefined ? <div className={styles.back}>{backAction}</div> : null}
          <p className={styles.title}>{title}</p>
        </div>

        <TextLink className={styles.brand ?? ''} to={routePaths.home}>
          Mister World
        </TextLink>
      </div>
    </header>
  );
}
