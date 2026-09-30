import type { HTMLAttributes, PropsWithChildren } from 'react';

import styles from '@/shared/ui/OptionCard/OptionCard.module.css';

interface OptionCardProps
  extends PropsWithChildren, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  isSelected?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

/**
 * 선택 가능한 native control을 감싸는 visual shell이다.
 *
 * CONTRACT: Selection semantics는 내부 또는 인접 native input/button이 소유한다.
 * 이 Component는 visual state와 focus-within만 반영한다.
 */
export function OptionCard({
  children,
  className,
  isDisabled = false,
  isInvalid = false,
  isSelected = false,
  ...rest
}: OptionCardProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div
      {...rest}
      className={classes}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
      data-selected={isSelected || undefined}
    >
      {children}
    </div>
  );
}
