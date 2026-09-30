export const mockScenarios = [
  'happy',
  'slow',
  'empty',
  'network-error',
  'server-500',
  'unauthorized-401',
  'conflict-409',
  'validation-422',
  'partial-failure',
  'image-failure',
  'offline',
  'stale-refresh',
  'reservation-success',
  'reservation-ambiguous-response',
  'history-empty',
  'history-populated',
  'honeymoon-valid-2-participants',
  'honeymoon-valid-4-participants',
  'honeymoon-invalid-1-participant',
  'honeymoon-invalid-3-participants',
] as const;

export type MockScenario = (typeof mockScenarios)[number];

export const defaultMockScenario: MockScenario = 'happy';

export function isMockScenario(value: string | null): value is MockScenario {
  return value !== null && mockScenarios.some((scenario) => scenario === value);
}
