import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { DevScenarioSwitcher } from '@/mocks/DevScenarioSwitcher';
import { worker } from '@/mocks/browser';

const DEV_TOOLS_ROOT_ID = 'mock-development-tools';

/**
 * Mock worker와 scenario selector를 development opt-in 환경에서 함께 시작한다.
 *
 * INVARIANT: 이 module은 production entry에서 정적으로 import하지 않는다.
 * Product Feature는 이 UI를 import하지 않고 mock composition boundary로만 사용한다.
 */
export async function startDevelopmentRuntime() {
  await worker.start({
    onUnhandledRequest: 'bypass',
  });

  const existingRoot = document.getElementById(DEV_TOOLS_ROOT_ID);

  if (existingRoot !== null) {
    return;
  }

  const devToolsRoot = document.createElement('div');
  devToolsRoot.id = DEV_TOOLS_ROOT_ID;
  document.body.append(devToolsRoot);

  createRoot(devToolsRoot).render(
    <StrictMode>
      <DevScenarioSwitcher />
    </StrictMode>,
  );
}
