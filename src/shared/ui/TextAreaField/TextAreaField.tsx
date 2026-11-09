import { useId, type TextareaHTMLAttributes } from 'react';

import styles from '@/shared/ui/TextAreaField/TextAreaField.module.css';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

/**
 * 공용 label 기반 native textarea다. `TextField`와 같은 접근성 계약을 따른다.
 *
 * CONTRACT: label/textarea/message 연결만 소유한다. 글자 수 제한 의미와 검증 규칙은
 * 호출자가 책임진다.
 */
export function TextAreaField({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  error,
  helperText,
  id,
  label,
  required = false,
  rows = 4,
  ...textAreaProps
}: TextAreaFieldProps) {
  const generatedId = useId();
  const textAreaId = id ?? `text-area-field-${generatedId}`;
  const message = error ?? helperText;
  const messageId = message === undefined ? undefined : `${textAreaId}-message`;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(' ') || undefined;
  const classes = [styles.textArea, className].filter(Boolean).join(' ');

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={textAreaId}>
        <span>{label}</span>
        {required ? (
          <span aria-hidden="true" className={styles.requiredIndicator}>
            *
          </span>
        ) : null}
      </label>

      <textarea
        {...textAreaProps}
        aria-describedby={describedBy}
        aria-invalid={error === undefined ? ariaInvalid : true}
        className={classes}
        id={textAreaId}
        required={required}
        rows={rows}
      />

      {message !== undefined ? (
        <p className={error === undefined ? styles.helper : styles.error} id={messageId}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
