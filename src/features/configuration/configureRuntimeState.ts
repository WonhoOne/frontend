import type { ConfigurationCategory } from '@/features/configuration/configurationModels';

export type ConfigurationGroupRuntimeState =
  | { status: 'ready' }
  | { status: 'loading' }
  | { status: 'refreshing' }
  | { status: 'stale' }
  | { status: 'error'; isRetrying: boolean }
  | { status: 'empty' }
  | { status: 'invalid' };

export interface ConfigureRuntimeState {
  connectivity: 'online' | 'offline';
  groups: Record<ConfigurationCategory, ConfigurationGroupRuntimeState>;
}

export function createReadyConfigureRuntimeState(): ConfigureRuntimeState {
  return {
    connectivity: 'online',
    groups: {
      hotel: { status: 'ready' },
      transport: { status: 'ready' },
      meal: { status: 'ready' },
      extras: { status: 'ready' },
    },
  };
}

/**
 * 성공 data를 화면에 유지할 수 있는 group state만 true다.
 *
 * loading/error/empty는 usable catalog가 없는 상태로 취급한다.
 * invalid는 기존 selection을 명시적으로 보여준 뒤 사용자가 다시 선택하게 해야 하므로
 * 현재 data를 유지한다.
 */
export function configurationGroupRetainsData(state: ConfigurationGroupRuntimeState) {
  return (
    state.status === 'ready' ||
    state.status === 'refreshing' ||
    state.status === 'stale' ||
    state.status === 'invalid'
  );
}

/**
 * Frontend가 현재 확실히 아는 blocking state만 판정한다.
 *
 * stale/refreshing은 성공 data를 유지하므로 이 함수만으로 Review를 막지 않는다.
 * offline 자체의 Review policy는 아직 Shared Contract/CP8 영역이므로 여기서 발명하지 않는다.
 */
export function configurationGroupBlocksReview(
  state: ConfigurationGroupRuntimeState,
  required: boolean,
) {
  if (!required) {
    return false;
  }

  return (
    state.status === 'loading' ||
    state.status === 'error' ||
    state.status === 'empty' ||
    state.status === 'invalid'
  );
}
