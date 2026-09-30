export const mockScenarios = [
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
] as const;

export type MockScenario = (typeof mockScenarios)[number];

export const defaultMockScenario: MockScenario = 'happy';

export function isMockScenario(value: string | null): value is MockScenario {
  return value !== null && mockScenarios.some((scenario) => scenario === value);
}
