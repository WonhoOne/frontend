import { useId, type InputHTMLAttributes } from 'react';

import styles from '@/shared/ui/TextField/TextField.module.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

/**
 * Shared labeled text input.
 *
 * CONTRACT: The component owns label/input/message accessibility wiring only.
 * Credential autocomplete values and Product validation rules remain callers'
 * responsibility until their contracts are approved.
 */
export function TextField({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  error,
  helperText,
  id,
  label,
  required = false,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? `text-field-${generatedId}`;
  const message = error ?? helperText;
  const messageId = message === undefined ? undefined : `${inputId}-message`;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(' ') || undefined;
  const classes = [styles.input, className].filter(Boolean).join(' ');

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={inputId}>
        <span>{label}</span>
        {required ? (
          <span aria-hidden="true" className={styles.requiredIndicator}>
            *
          </span>
        ) : null}
      </label>

      <input
        {...inputProps}
        aria-describedby={describedBy}
        aria-invalid={error === undefined ? ariaInvalid : true}
        className={classes}
        id={inputId}
        required={required}
      />

      {message !== undefined ? (
        <p className={error === undefined ? styles.helper : styles.error} id={messageId}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
