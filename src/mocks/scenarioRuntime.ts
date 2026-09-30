import { defaultMockScenario, isMockScenario, type MockScenario } from '@/mocks/scenarios';

export const mockScenarioSearchParam = 'mockScenario';

export function readMockScenario(search?: string): MockScenario {
  const currentSearch = search ?? (typeof window === 'undefined' ? '' : window.location.search);
  const selectedScenario = new URLSearchParams(currentSearch).get(mockScenarioSearchParam);

  return isMockScenario(selectedScenario) ? selectedScenario : defaultMockScenario;
}

/**
 * Development scenario를 URL에 보존해 test와 manual QA가 동일 상태를 재현하게 한다.
 *
 * CONTRACT: scenario key만 선택하며 Backend endpoint/DTO/response shape는 정의하지 않는다.
 * history entry를 추가하지 않아 scenario 전환이 Product navigation history를 오염시키지 않는다.
 */
export function writeMockScenario(scenario: MockScenario) {
  const nextUrl = new URL(window.location.href);

  nextUrl.searchParams.set(mockScenarioSearchParam, scenario);
  window.history.replaceState(window.history.state, '', nextUrl);
}
