import type { HTMLAttributes, PropsWithChildren } from 'react';

import styles from '@/shared/ui/OptionCard/OptionCard.module.css';

interface OptionCardProps
  extends PropsWithChildren, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  isSelected?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

/**
 * Visual shell for selectable native controls.
 *
 * CONTRACT: Selection semantics stay with the nested/adjacent native input or
 * button. This component only reflects visual state and focus-within.
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
