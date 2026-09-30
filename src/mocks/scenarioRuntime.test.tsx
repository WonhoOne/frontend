// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DevScenarioSwitcher } from '@/mocks/DevScenarioSwitcher';
import { mockScenarioSearchParam, readMockScenario } from '@/mocks/scenarioRuntime';
import { defaultMockScenario, mockScenarios } from '@/mocks/scenarios';

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('mock scenario runtime', () => {
  it('exposes the canonical scenario registry without Product payload assumptions', () => {
    expect(mockScenarios).toEqual([
      'happy',
      'slow',
      'empty',
      'network-error',
      '500',
      '401',
      '409',
      '422',
      'partial-failure',
      'image-failure',
      'offline',
      'stale-refresh',
      'reservation-success',
      'ambiguous-response',
      'history-empty',
      'history-populated',
    ]);
  });

  it('falls back to happy when the URL does not contain a known scenario', () => {
    expect(readMockScenario('?mockScenario=not-a-scenario')).toBe(defaultMockScenario);
    expect(readMockScenario('')).toBe(defaultMockScenario);
  });

  it('changes the scenario through the dev switcher and preserves unrelated search params', () => {
    window.history.replaceState({}, '', '/?keep=1');

    render(<DevScenarioSwitcher />);

    const select = screen.getByRole('combobox', { name: 'Mock scenario' });

    expect(select).toHaveValue('happy');

    fireEvent.change(select, { target: { value: 'network-error' } });

    expect(select).toHaveValue('network-error');

    const search = new URLSearchParams(window.location.search);

    expect(search.get(mockScenarioSearchParam)).toBe('network-error');
    expect(search.get('keep')).toBe('1');
  });
});
