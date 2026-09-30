import type { HTMLAttributes, PropsWithChildren } from 'react';

import styles from '@/shared/ui/Grid/Grid.module.css';

interface GridProps extends PropsWithChildren, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {}

/**
 * Section 배치나 DOM 순서를 강제하지 않는 공용 responsive grid다.
 *
 * INVARIANT: breakpoint에 따라 visual layout은 바뀔 수 있지만,
 * semantic source order는 호출자가 자신의 markup에서 유지한다.
 */
export function Grid({ children, className, ...rest }: GridProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
