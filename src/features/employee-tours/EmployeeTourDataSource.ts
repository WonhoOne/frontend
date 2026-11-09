import type {
  EmployeeTourProduct,
  TourProductWriteInput,
} from '@/features/employee-tours/employeeTour.model';

/** 직원 여행상품 server boundary. Backend와 Mock이 같은 계약을 구현한다. */
export interface EmployeeTourDataSource {
  listTourProducts(signal?: AbortSignal): Promise<readonly EmployeeTourProduct[]>;
  createTourProduct(input: TourProductWriteInput): Promise<EmployeeTourProduct>;
  updateTourProduct(id: string, input: TourProductWriteInput): Promise<EmployeeTourProduct>;
}
