import type { HTMLAttributes } from 'react';

import styles from '@/shared/ui/Skeleton/Skeleton.module.css';

export type SkeletonVariant = 'line' | 'block' | 'circle';

export interface SkeletonProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-hidden' | 'children'
> {
  variant?: SkeletonVariant;
}

/**
 * Presentational loading geometry for Feature-owned skeleton compositions.
 *
 * CONTRACT: Loading meaning belongs to the parent section via aria-busy/status
 * text. Individual skeleton shapes stay hidden from assistive technology.
 */
export function Skeleton({ className, variant = 'block', ...rest }: SkeletonProps) {
  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  return <div {...rest} aria-hidden="true" className={classes} data-skeleton-variant={variant} />;
}
