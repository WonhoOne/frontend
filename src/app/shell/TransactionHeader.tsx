import type { ReactNode } from 'react';

import { TextLink } from '@/shared/ui';
import { routePaths } from '@/app/router/paths';

import styles from '@/app/shell/TransactionHeader.module.css';

interface TransactionHeaderProps {
  title: string;
  backAction?: ReactNode;
}

/**
 * Minimal application chrome for configuration/reservation route surfaces.
 *
 * CONTRACT: Feature state and navigation decisions are injected by callers.
 * The header never queries Reservation or Configuration data itself.
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
