import type { ProductFormField } from '@/features/employee-tours/employeeTour.model';

/** 오류 요약 링크가 포커스를 옮길 수 있도록 각 필드의 DOM id를 한곳에서 정한다. */
export function productFieldId(field: ProductFormField | 'stylePrices'): string {
  return `employee-product-${field.replace('.', '-').toLowerCase()}`;
}
