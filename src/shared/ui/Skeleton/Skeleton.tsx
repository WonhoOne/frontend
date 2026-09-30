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
 * Feature가 조합하는 skeleton을 위한 presentational loading geometry다.
 *
 * CONTRACT: Loading의 의미는 상위 section의 aria-busy/status text가 소유한다.
 * 개별 skeleton shape는 assistive technology에서 숨긴다.
 */
export function Skeleton({ className, variant = 'block', ...rest }: SkeletonProps) {
  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  return <div {...rest} aria-hidden="true" className={classes} data-skeleton-variant={variant} />;
}
