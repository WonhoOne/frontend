import type {
  ReservationDraftResourceIdentity,
  ReservationDraftTourStyle,
} from '@/features/reservation/ReservationDraft';
import type { ReservationDraftAction } from '@/features/reservation/reservationDraftReducer';

export interface ConfigureHandoffIntent {
  tourProductId: ReservationDraftResourceIdentity;
  tourStyle: ReservationDraftTourStyle;
  tourScheduleId: ReservationDraftResourceIdentity;
}

export type BeginConfigureAction = Extract<ReservationDraftAction, { type: 'BEGIN_CONFIGURE' }>;

/**
 * Tour Detail 같은 upstream page가 Configure transaction을 시작할 때 쓰는 public action factory.
 *
 * BOUNDARY:
 * - reservation feature는 navigation을 소유하지 않는다.
 * - caller/page가 이 action을 dispatch한 뒤 routeBuilders.configure(tourProductId)로 이동한다.
 * - 이전 transaction의 participant/configuration intent는 reducer가 원자적으로 초기화한다.
 * - Backend DTO나 Session B private model을 요구하지 않는다.
 */
export function createConfigureHandoffAction(
  intent: ConfigureHandoffIntent,
  updatedAt: number,
): BeginConfigureAction {
  return {
    type: 'BEGIN_CONFIGURE',
    tourProductId: intent.tourProductId,
    tourStyle: intent.tourStyle,
    tourScheduleId: intent.tourScheduleId,
    updatedAt,
  };
}
