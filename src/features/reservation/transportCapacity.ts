import type { ReservationTransportOption } from '@/features/reservation/reservation.model';
import { transportOptions } from '@/integrations/backend/contracts';

/**
 * Shared v0.2 TransportOption 정원.
 *
 * CONTRACT: `docs` API Spec §Configuration — `PRIVATE_LUXURY_CAR_2` capacity 2,
 * `PREMIUM_VAN_10` capacity 10. 값을 바꾸려면 docs-first로 Shared Contract를 먼저 바꾼다.
 */
export const TRANSPORT_CAPACITY: Readonly<Record<ReservationTransportOption, number>> = {
  PRIVATE_LUXURY_CAR_2: 2,
  PREMIUM_VAN_10: 10,
};

export type TransportCapacityCheck =
  | { status: 'incomplete' }
  | {
      status: 'fits' | 'exceeded';
      transportOption: ReservationTransportOption;
      capacity: number;
      participantCount: number;
    };

export interface TransportCapacityCandidate {
  participantCount: number | null;
  transportSelectionKey: string | null;
}

function toTransportOption(selectionKey: string): ReservationTransportOption | null {
  return transportOptions.find((option) => option === selectionKey) ?? null;
}

/**
 * 후보 인원 수와 후보 차량이 BR-20("차량 정원 ≥ participantCount")을 만족하는지 미리 확인한다.
 *
 * WHY: 정원 초과 조합은 Backend가 신청 시점에 `422 CAPACITY_EXCEEDED`로 거절한다.
 * 그 전에 Configure·Review·Voice가 같은 기준으로 사용자에게 알려 주기 위한 공통 검사다
 * (UML 감사 D-01, frontend#66). 최종 판정 권한은 계속 Backend에 있다.
 *
 * CONTRACT:
 * - 입력은 "후보" 값이다. Draft를 바꾸기 전에 호출해 결과를 볼 수 있다 (Voice #68).
 * - 인원이나 차량이 아직 없으면 `incomplete`다. 작성 중인 부분 상태는 막지 않는다.
 * - 선택 키는 Shared v0.2 canonical ID다. 알 수 없는 키는 정원을 추측하지 않고 `incomplete`로 둔다.
 * - 결과만 돌려준다. 차량이나 인원을 자동으로 바꾸지 않는다.
 */
export function checkTransportCapacity({
  participantCount,
  transportSelectionKey,
}: TransportCapacityCandidate): TransportCapacityCheck {
  if (participantCount === null || transportSelectionKey === null) {
    return { status: 'incomplete' };
  }

  const transportOption = toTransportOption(transportSelectionKey);
  if (transportOption === null) {
    return { status: 'incomplete' };
  }

  const capacity = TRANSPORT_CAPACITY[transportOption];
  return {
    status: participantCount > capacity ? 'exceeded' : 'fits',
    transportOption,
    capacity,
    participantCount,
  };
}
