import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from '@/shared/ui/Button/Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
}

/**
 * Shared native button control.
 *
 * CONTRACT: Loading only changes interaction/presentation mechanics. Mutation
 * meaning, retry policy, and Product-specific labels remain caller-owned.
 */
export function Button({
  'aria-label': ariaLabel,
  children,
  className,
  disabled = false,
  isLoading = false,
  loadingLabel = 'Loading',
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...rest
}: ButtonProps) {
  const classes = [styles.root, styles[variant], styles[size], className].filter(Boolean).join(' ');

  return (
    <button
      {...rest}
      aria-busy={isLoading || undefined}
      aria-label={isLoading ? loadingLabel : ariaLabel}
      className={classes}
      disabled={disabled || isLoading}
      type={type}
    >
      <span className={styles.label}>
        <span className={isLoading ? styles.idleLabelHidden : undefined}>{children}</span>
        {isLoading ? (
          <span className={styles.loadingContent}>
            <span aria-hidden="true" className={styles.spinner} />
            <span>{loadingLabel}</span>
          </span>
        ) : null}
      </span>
    </button>
  );
}
