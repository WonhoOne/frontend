import { useState } from 'react';

import { readMockScenario, writeMockScenario } from '@/mocks/scenarioRuntime';
import { isMockScenario, mockScenarios } from '@/mocks/scenarios';

import styles from '@/mocks/DevScenarioSwitcher.module.css';

export function DevScenarioSwitcher() {
  const [scenario, setScenario] = useState(readMockScenario);

  return (
    <aside className={styles.root} data-testid="dev-scenario-switcher">
      <label className={styles.label} htmlFor="mock-scenario">
        Mock scenario
      </label>
      <select
        className={styles.select}
        id="mock-scenario"
        onChange={(event) => {
          const nextScenario = event.currentTarget.value;

          if (!isMockScenario(nextScenario)) {
            return;
          }

          writeMockScenario(nextScenario);
          setScenario(nextScenario);
        }}
        value={scenario}
      >
        {mockScenarios.map((scenarioName) => (
          <option key={scenarioName} value={scenarioName}>
            {scenarioName}
          </option>
        ))}
      </select>
    </aside>
  );
}
