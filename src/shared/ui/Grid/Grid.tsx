import type { HTMLAttributes, PropsWithChildren } from 'react';

import styles from '@/shared/ui/Grid/Grid.module.css';

interface GridProps extends PropsWithChildren, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {}

/**
 * Provides the shared responsive layout grid without prescribing section
 * placement or DOM ordering.
 *
 * INVARIANT: Visual layout may change by breakpoint, but callers keep semantic
 * source order in their own markup.
 */
export function Grid({ children, className, ...rest }: GridProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
