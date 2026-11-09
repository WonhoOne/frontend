import type { EmployeeTourProduct } from '@/features/employee-tours/employeeTour.model';
import { tourStyleLabel } from '@/features/employee-tours/productFormRules';
import styles from '@/features/employee-tours/StylePriceList.module.css';
import { formatKrw } from '@/shared/lib/formatKrw';

/** Style별 1인 가격 읽기 전용 목록 (Classic → Grand → Premium). */
export function StylePriceList({
  stylePrices,
}: {
  stylePrices: EmployeeTourProduct['stylePrices'];
}) {
  return (
    <dl className={styles.root}>
      {stylePrices.map(({ style, amount }) => (
        <div className={styles.row} key={style}>
          <dt>{tourStyleLabel(style)}</dt>
          <dd>{formatKrw(amount)}</dd>
        </div>
      ))}
    </dl>
  );
}
