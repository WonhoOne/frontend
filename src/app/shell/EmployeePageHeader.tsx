import type { ReactNode } from 'react';

import styles from '@/app/shell/EmployeePageHeader.module.css';
import { TextLink } from '@/shared/ui';

interface EmployeePageHeaderProps {
  title: string;
  /** 제목 옆 개수 (E02). 화면낭독기에는 "총 n개"로 읽힌다. */
  count?: number;
  breadcrumb?: { label: string; to: string };
  /** 제목 아래 보조 줄 (E04 ID · Theme, E05 설명) */
  meta?: ReactNode;
  actions?: ReactNode;
}

/**
 * 직원 화면 공통 page header (CP3 `EmployeePageHeader`).
 * CONTRACT: page마다 H1은 하나다. Customer `PageShell`의 editorial 크기는 쓰지 않는다.
 */
export function EmployeePageHeader({
  actions,
  breadcrumb,
  count,
  meta,
  title,
}: EmployeePageHeaderProps) {
  return (
    <header className={styles.root}>
      <div className={styles.titleBlock}>
        {breadcrumb === undefined ? null : (
          <TextLink className={styles.breadcrumb ?? ''} to={breadcrumb.to}>
            {breadcrumb.label}
          </TextLink>
        )}
        <h1 className={styles.title}>
          {title}
          {count === undefined ? null : (
            <span className={styles.count}>
              <span aria-hidden="true">{count}</span>
              <span className={styles.visuallyHidden}>총 {count}개</span>
            </span>
          )}
        </h1>
        {meta === undefined ? null : <div className={styles.meta}>{meta}</div>}
      </div>
      {actions === undefined ? null : <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
