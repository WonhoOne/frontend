import type {
  EmployeeTourProduct,
  TourProductWriteInput,
} from '@/features/employee-tours/employeeTour.model';
import type { EmployeeTourDataSource } from '@/features/employee-tours/EmployeeTourDataSource';
import { allowedStylesForTheme } from '@/features/employee-tours/productFormRules';
import { BackendHttpError } from '@/integrations/backend/client/backendHttpError';

/**
 * DEV(`VITE_ENABLE_MOCKS=true`)와 테스트용 in-memory 구현이다 (CP8 §5).
 *
 * CONTRACT: Backend와 같은 오류 class/code를 던져 화면이 같은 경로로 처리하게 한다.
 * Synthetic data only. Production build에는 composition root가 포함하지 않는다.
 */
export class MockEmployeeTourDataSource implements EmployeeTourDataSource {
  private products: EmployeeTourProduct[];
  private nextId: number;

  constructor(
    seed: readonly EmployeeTourProduct[] = [],
    /** 일정이 연결된 상품 id. 다른 Theme으로 바꾸면 409를 돌려준다 (BR-31). */
    private readonly scheduledProductIds: ReadonlySet<string> = new Set(),
  ) {
    this.products = [...seed];
    this.nextId = Math.max(0, ...seed.map((product) => Number(product.id))) + 1;
  }

  listTourProducts() {
    return Promise.resolve([...this.products]);
  }

  createTourProduct(input: TourProductWriteInput) {
    this.assertAllowedStyles(input);
    const created: EmployeeTourProduct = { id: String(this.nextId), ...input };
    this.nextId += 1;
    this.products = [...this.products, created];
    return Promise.resolve(created);
  }

  updateTourProduct(id: string, input: TourProductWriteInput) {
    const current = this.products.find((product) => product.id === id);

    if (current === undefined) {
      return Promise.reject(mockHttpError(404, 'TOUR_PRODUCT_NOT_FOUND'));
    }

    if (this.scheduledProductIds.has(id) && current.theme !== input.theme) {
      return Promise.reject(mockHttpError(409, 'TOUR_PRODUCT_THEME_LOCKED'));
    }

    this.assertAllowedStyles(input);
    const updated: EmployeeTourProduct = { id, ...input };
    this.products = this.products.map((product) => (product.id === id ? updated : product));
    return Promise.resolve(updated);
  }

  private assertAllowedStyles(input: TourProductWriteInput) {
    const allowed = allowedStylesForTheme(input.theme);
    const sent = input.stylePrices.map(({ style }) => style);

    if (sent.length !== allowed.length || sent.some((style) => !allowed.includes(style))) {
      throw mockHttpError(422, 'VALIDATION_FAILED', [{ field: 'stylePrices', code: 'REQUIRED' }]);
    }
  }
}

export function mockHttpError(
  status: number,
  code: string,
  fieldErrors: ReadonlyArray<{ field: string; code: string }> = [],
) {
  return new BackendHttpError(
    { status, statusText: 'Mock', headers: { 'content-type': 'application/json' } },
    {
      code,
      message: 'Synthetic mock error',
      // CONTRACT: ApiError field errors always carry a message (REST v0.2).
      fieldErrors: fieldErrors.map((fieldError) => ({ ...fieldError, message: 'Synthetic' })),
    },
  );
}
