import type { EmployeeTourProduct } from '@/features/employee-tours/employeeTour.model';
import styles from '@/features/employee-tours/ProductTable.module.css';
import { StylePriceList } from '@/features/employee-tours/StylePriceList';
import { ThemeLabel } from '@/features/employee-tours/ThemeLabel';
import { TextLink } from '@/shared/ui';

interface ProductTableProps {
  products: readonly EmployeeTourProduct[];
  /** route 정의는 app이 소유하므로 편집 경로는 page가 넘긴다. */
  editHref: (id: string) => string;
  highlightedId?: string | null;
}

/**
 * 여행상품 목록 표 (E02 §5).
 *
 * CONTRACT: 행 순서는 Backend 응답 순서(id 오름차순) 그대로다. 상품명 링크가 행의
 * 유일한 interactive element다 (CP2-A V1).
 */
export function ProductTable({ editHref, highlightedId = null, products }: ProductTableProps) {
  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <caption className={styles.caption}>여행상품 목록</caption>
        <thead>
          <tr>
            <th scope="col">상품명</th>
            <th scope="col">테마</th>
            <th scope="col">스타일별 1인 가격</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              className={product.id === highlightedId ? styles.highlighted : undefined}
              data-product-id={product.id}
              key={product.id}
            >
              <td>
                <TextLink className={styles.name ?? ''} to={editHref(product.id)}>
                  {product.name}
                </TextLink>
                <span className={styles.meta}>ID {product.id}</span>
              </td>
              <td>
                <ThemeLabel theme={product.theme} />
              </td>
              <td className={styles.prices}>
                <StylePriceList stylePrices={product.stylePrices} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
