import { useEffect, useRef } from 'react';

import styles from '@/features/employee-tours/FormErrorSummary.module.css';

interface FormErrorSummaryProps {
  items: ReadonlyArray<{ fieldId: string; message: string }>;
  /** 값이 바뀔 때마다 요약으로 포커스를 옮긴다 (제출 실패 횟수 등). */
  focusKey: number;
}

/**
 * 제출 실패 시 폼 위에 보이는 오류 요약 (CP4 §3, CP9 A4).
 * 각 항목은 해당 필드로 포커스를 옮기는 링크다.
 */
export function FormErrorSummary({ focusKey, items }: FormErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusKey > 0) {
      ref.current?.focus();
    }
  }, [focusKey]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.root} ref={ref} role="alert" tabIndex={-1}>
      <p className={styles.title}>입력 내용을 확인해 주세요 ({items.length}개 항목)</p>
      <ul className={styles.list}>
        {items.map(({ fieldId, message }) => (
          <li key={fieldId}>
            <a
              href={`#${fieldId}`}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(fieldId)?.focus();
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
