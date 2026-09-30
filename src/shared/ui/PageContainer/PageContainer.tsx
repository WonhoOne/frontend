import type { HTMLAttributes, PropsWithChildren } from 'react';

import styles from '@/shared/ui/PageContainer/PageContainer.module.css';

export type PageContainerVariant = 'wide' | 'main' | 'transaction' | 'reading' | 'auth';

interface PageContainerProps
  extends PropsWithChildren, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: PageContainerVariant;
}

/**
 * 승인된 responsive page gutter 안에서 route content를 중앙 정렬한다.
 *
 * CONTRACT: variant 이름은 layout width만 설명한다.
 * Product/Page semantics를 이 primitive에 인코딩하지 않는다.
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
