import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';

import styles from '@/shared/ui/SelectField/SelectField.module.css';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
  error?: string;
  helperText?: string;
}

/**
 * 공용 label 기반 native select다. `TextField`와 같은 접근성 계약을 따른다.
 *
 * CONTRACT: label/select/message 연결만 소유한다. 선택지의 의미와 검증 규칙은
 * 호출자가 책임진다.
 */
export function SelectField({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  children,
  className,
  error,
  helperText,
  id,
  label,
  required = false,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? `select-field-${generatedId}`;
  const message = error ?? helperText;
  const messageId = message === undefined ? undefined : `${selectId}-message`;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(' ') || undefined;
  const classes = [styles.select, className].filter(Boolean).join(' ');

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={selectId}>
        <span>{label}</span>
        {required ? (
          <span aria-hidden="true" className={styles.requiredIndicator}>
            *
          </span>
        ) : null}
      </label>

      <select
        {...selectProps}
        aria-describedby={describedBy}
        aria-invalid={error === undefined ? ariaInvalid : true}
        className={classes}
        id={selectId}
        required={required}
      >
        {children}
      </select>

      {message !== undefined ? (
        <p className={error === undefined ? styles.helper : styles.error} id={messageId}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
