import type { PriceDisplayModel } from '@/features/configuration/configurationModels';
import { Button, Skeleton } from '@/shared/ui';

import styles from '@/features/configuration/PriceSummary.module.css';

interface PriceSummaryProps {
  price: PriceDisplayModel;
  onRetry?: () => void;
}

/**
 * Configure 가격 표시의 presentation-only boundary.
 *
 * CONTRACT:
 * - 전달받은 display label만 보여주며 금액/할인/option delta를 계산하지 않는다.
 * - previousTotalLabel이 있으면 loading/recalculating/error 동안 계속 유지한다.
 * - 이전 가격이 없는 loading은 Skeleton으로 표현하고 0/임의 금액을 만들지 않는다.
 * - price failure는 configuration selection이나 Review readiness를 변경하지 않는다.
 */
export function PriceSummary({ price, onRetry }: PriceSummaryProps) {
  return (
    <section aria-label="Price" className={styles.root}>
      <span className={styles.label}>Price</span>

      {price.state === 'unavailable' ? (
        <p className={styles.message}>{price.message}</p>
      ) : price.state === 'known' ? (
        <strong className={styles.total}>{price.totalLabel}</strong>
      ) : price.state === 'loading' ? (
        price.previousTotalLabel === null ? (
          <div aria-busy="true" aria-label="Price loading" className={styles.loading}>
            <Skeleton className={styles.skeleton} variant="line" />
          </div>
        ) : (
          <div className={styles.valueState} role="status">
            <strong className={styles.total}>{price.previousTotalLabel}</strong>
            <span className={styles.status}>Checking latest price</span>
          </div>
        )
      ) : price.state === 'recalculating' ? (
        <div className={styles.valueState} role="status">
          <strong className={styles.total}>{price.previousTotalLabel}</strong>
          <span className={styles.status}>Updating price</span>
        </div>
      ) : (
        <div className={styles.valueState} role="status">
          {price.previousTotalLabel !== null ? (
            <strong className={styles.total}>{price.previousTotalLabel}</strong>
          ) : null}
          <p className={styles.error}>{price.message}</p>
          {onRetry !== undefined ? (
            <Button onClick={onRetry} size="small" variant="secondary">
              Retry price
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
