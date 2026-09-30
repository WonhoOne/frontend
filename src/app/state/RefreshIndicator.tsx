import styles from '@/app/state/StatePresentation.module.css';

export type RefreshIndicatorState = 'refreshing' | 'stale';

interface RefreshIndicatorProps {
  state: RefreshIndicatorState;
  label: string;
}

/**
 * 기존 성공 content를 유지한 채 refresh/stale 상태만 보조적으로 표시한다.
 *
 * CONTRACT: content replacement나 refetch 실행은 하지 않고 presentation signal만 제공한다.
 */
export function RefreshIndicator({ label, state }: RefreshIndicatorProps) {
  return (
    <span aria-live="polite" className={styles.indicator} data-refresh-state={state} role="status">
      <span aria-hidden="true" className={styles.indicatorDot} />
      {label}
    </span>
  );
}
