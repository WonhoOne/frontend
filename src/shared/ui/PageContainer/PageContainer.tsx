import type { HTMLAttributes, PropsWithChildren } from 'react';

import styles from '@/shared/ui/PageContainer/PageContainer.module.css';

export type PageContainerVariant = 'wide' | 'main' | 'transaction' | 'reading' | 'auth';

interface PageContainerProps
  extends PropsWithChildren, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: PageContainerVariant;
}

/**
 * Centers route content inside the approved responsive page gutters.
 *
 * CONTRACT: The variant names describe layout width only. Product/page
 * semantics must not be encoded into this primitive.
 */
export function PageContainer({
  children,
  className,
  variant = 'main',
  ...rest
}: PageContainerProps) {
  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
