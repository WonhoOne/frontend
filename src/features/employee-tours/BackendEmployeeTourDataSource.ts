import {
  adaptEmployeeTourProduct,
  toTourProductWriteRequestDto,
} from '@/features/employee-tours/employeeTour.adapter';
import type { TourProductWriteInput } from '@/features/employee-tours/employeeTour.model';
import type { EmployeeTourDataSource } from '@/features/employee-tours/EmployeeTourDataSource';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { decodeTourProductDto, decodeTourProductListDto } from '@/integrations/backend/contracts';
import { parseBackendResourceIdentity } from '@/shared/lib/resourceIdentity';

/**
 * REST v0.2 Employee TourProduct endpoint.
 *
 * SECURITY: 모든 요청은 `authentication: 'required'`로 중앙 client가 Bearer를 붙인다.
 * 화면별 fetch나 Authorization header를 만들지 않는다 (F1-09 handoff).
 */
export class BackendEmployeeTourDataSource implements EmployeeTourDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async listTourProducts(signal?: AbortSignal) {
    const response = await this.client.requestJson({
      path: '/employee/tours',
      authentication: 'required',
      ...(signal === undefined ? {} : { signal }),
    });

    return decodeTourProductListDto(response.body).map(adaptEmployeeTourProduct);
  }

  async createTourProduct(input: TourProductWriteInput) {
    const response = await this.client.requestJson({
      path: '/employee/tours',
      method: 'POST',
      authentication: 'required',
      body: toTourProductWriteRequestDto(input),
    });

    return adaptEmployeeTourProduct(decodeTourProductDto(response.body));
  }

  async updateTourProduct(id: string, input: TourProductWriteInput) {
    const backendId = parseBackendResourceIdentity(id);

    if (backendId === null) {
      throw new RangeError('Tour product id must be a canonical positive integer.');
    }

    const response = await this.client.requestJson({
      path: `/employee/tours/${backendId}`,
      method: 'PUT',
      authentication: 'required',
      body: toTourProductWriteRequestDto(input),
    });

    return adaptEmployeeTourProduct(decodeTourProductDto(response.body));
  }
}
