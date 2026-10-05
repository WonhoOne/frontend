// @vitest-environment node
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  VOICE_COMMAND_NAMES,
  VOICE_THEMES,
  VOICE_TOUR_STYLES,
  VOICE_HOTEL_OPTIONS,
  VOICE_TRANSPORT_OPTIONS,
  VOICE_MEAL_OPTIONS,
  VOICE_EXTRA_OPTIONS,
  type VoiceCommand,
  type VoiceCommandName,
} from '../../integrations/voice/voiceCommand';
import { executeVoiceCommand, type VoiceBridgeCapabilities } from './index';

type DispatchCase = {
  command: VoiceCommand;
  capability: keyof VoiceBridgeCapabilities;
  value: unknown;
};

// A new canonical name must gain a dispatch case at compile time as well.
const cases = {
  SHOW_TOURS: {
    command: { version: 1, command: 'SHOW_TOURS', args: {} },
    capability: 'showTours',
    value: undefined,
  },
  SELECT_THEME: {
    command: { version: 1, command: 'SELECT_THEME', args: { theme: 'GOLF_CHALLENGE' } },
    capability: 'selectTheme',
    value: 'GOLF_CHALLENGE',
  },
  SELECT_TOUR_PRODUCT: {
    command: {
      version: 1,
      command: 'SELECT_TOUR_PRODUCT',
      args: { tourProductId: Number.MAX_SAFE_INTEGER },
    },
    capability: 'selectTourProduct',
    value: Number.MAX_SAFE_INTEGER,
  },
  SELECT_STYLE: {
    command: { version: 1, command: 'SELECT_STYLE', args: { style: 'CLASSIC' } },
    capability: 'selectStyle',
    value: 'CLASSIC',
  },
  SELECT_SCHEDULE: {
    command: { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 9007199254740990 } },
    capability: 'selectSchedule',
    value: 9007199254740990,
  },
  SET_PARTICIPANT_COUNT: {
    command: { version: 1, command: 'SET_PARTICIPANT_COUNT', args: { participantCount: 7 } },
    capability: 'setParticipantCount',
    value: 7,
  },
  CHANGE_HOTEL: {
    command: { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption: 'HOTEL_5_STAR' } },
    capability: 'changeHotel',
    value: 'HOTEL_5_STAR',
  },
  CHANGE_TRANSPORT: {
    command: {
      version: 1,
      command: 'CHANGE_TRANSPORT',
      args: { transportOption: 'PRIVATE_LUXURY_CAR_2' },
    },
    capability: 'changeTransport',
    value: 'PRIVATE_LUXURY_CAR_2',
  },
  CHANGE_MEAL: {
    command: { version: 1, command: 'CHANGE_MEAL', args: { mealOption: 'PREMIUM_RESTAURANT' } },
    capability: 'changeMeal',
    value: 'PREMIUM_RESTAURANT',
  },
  ADD_OPTION: {
    command: { version: 1, command: 'ADD_OPTION', args: { extraOption: 'CHAMPAGNE' } },
    capability: 'addOption',
    value: 'CHAMPAGNE',
  },
  REMOVE_OPTION: {
    command: { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'COFFEE' } },
    capability: 'removeOption',
    value: 'COFFEE',
  },
} satisfies Record<VoiceCommandName, DispatchCase>;

function capabilitySpies() {
  return {
    showTours: vi.fn(),
    selectTheme: vi.fn(),
    selectTourProduct: vi.fn(),
    selectStyle: vi.fn(),
    selectSchedule: vi.fn(),
    setParticipantCount: vi.fn(),
    changeHotel: vi.fn(),
    changeTransport: vi.fn(),
    changeMeal: vi.fn(),
    addOption: vi.fn(),
    removeOption: vi.fn(),
  } satisfies VoiceBridgeCapabilities;
}

afterEach(() => vi.unstubAllGlobals());

describe('canonical dispatch boundary', () => {
  it('covers exactly the 11 canonical names and exposes only selection capabilities', () => {
    expect(VOICE_COMMAND_NAMES).toHaveLength(11);
    expect(Object.keys(cases)).toEqual([...VOICE_COMMAND_NAMES]);
    expect(Object.values(cases).map(({ command }) => command.command)).toEqual([
      ...VOICE_COMMAND_NAMES,
    ]);
    expectTypeOf<keyof VoiceBridgeCapabilities>().toEqualTypeOf<
      | 'showTours'
      | 'selectTheme'
      | 'selectTourProduct'
      | 'selectStyle'
      | 'selectSchedule'
      | 'setParticipantCount'
      | 'changeHotel'
      | 'changeTransport'
      | 'changeMeal'
      | 'addOption'
      | 'removeOption'
    >();
    expectTypeOf<VoiceBridgeCapabilities>().toMatchTypeOf<Partial<VoiceBridgeCapabilities>>();
    const empty: VoiceBridgeCapabilities = {};
    expect(empty).toEqual({});
  });

  it.each(Object.values(cases))('dispatches $command.command exactly once', (testCase) => {
    const spies = capabilitySpies();
    const before = structuredClone(testCase.command);
    expect(executeVoiceCommand(testCase.command, spies)).toEqual({
      ok: true,
      command: testCase.command.command,
    });
    expect(spies[testCase.capability]).toHaveBeenCalledExactlyOnceWith(testCase.value);
    for (const [name, spy] of Object.entries(spies)) {
      if (name !== testCase.capability) expect(spy).not.toHaveBeenCalled();
    }
    expect(testCase.command).toEqual(before);
  });

  it.each(Object.values(cases))('fails without fallback for missing $capability', (testCase) => {
    const spies = capabilitySpies();
    const capabilities: VoiceBridgeCapabilities = { ...spies };
    delete capabilities[testCase.capability];
    expect(executeVoiceCommand(testCase.command, capabilities)).toEqual({
      ok: false,
      command: testCase.command.command,
      error: { code: 'CAPABILITY_UNAVAILABLE' },
    });
    for (const spy of Object.values(spies)) expect(spy).not.toHaveBeenCalled();
  });

  it.each(Object.values(cases))(
    'contains exceptions from $capability without retry',
    (testCase) => {
      const spies = capabilitySpies();
      spies[testCase.capability].mockImplementation(() => {
        throw new Error('private credentials and transcript');
      });
      const result = executeVoiceCommand(testCase.command, spies);
      expect(result).toEqual({
        ok: false,
        command: testCase.command.command,
        error: { code: 'CAPABILITY_FAILED' },
      });
      expect(JSON.stringify(result)).not.toContain('private');
      expect(spies[testCase.capability]).toHaveBeenCalledOnce();
      for (const [name, spy] of Object.entries(spies)) {
        if (name !== testCase.capability) expect(spy).not.toHaveBeenCalled();
      }
    },
  );

  it.each(['SELECT_TOUR_PRODUCT', 'SELECT_SCHEDULE', 'SET_PARTICIPANT_COUNT'] as const)(
    'preserves the exact numeric argument for %s',
    (name) => {
      const testCase = cases[name];
      const spies = capabilitySpies();
      executeVoiceCommand(testCase.command, spies);
      const actual: unknown = spies[testCase.capability].mock.calls[0]?.[0];
      expect(typeof actual).toBe('number');
      expect(actual).toBe(testCase.value);
    },
  );

  const catalogCases: DispatchCase[] = [
    ...VOICE_THEMES.flatMap((theme): DispatchCase[] => [
      {
        command: { version: 1, command: 'SHOW_TOURS', args: { theme } },
        capability: 'showTours',
        value: theme,
      },
      {
        command: { version: 1, command: 'SELECT_THEME', args: { theme } },
        capability: 'selectTheme',
        value: theme,
      },
    ]),
    ...VOICE_TOUR_STYLES.map((style): DispatchCase => ({
      command: { version: 1, command: 'SELECT_STYLE', args: { style } },
      capability: 'selectStyle',
      value: style,
    })),
    ...VOICE_HOTEL_OPTIONS.map((hotelOption): DispatchCase => ({
      command: { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption } },
      capability: 'changeHotel',
      value: hotelOption,
    })),
    ...VOICE_TRANSPORT_OPTIONS.map((transportOption): DispatchCase => ({
      command: { version: 1, command: 'CHANGE_TRANSPORT', args: { transportOption } },
      capability: 'changeTransport',
      value: transportOption,
    })),
    ...VOICE_MEAL_OPTIONS.map((mealOption): DispatchCase => ({
      command: { version: 1, command: 'CHANGE_MEAL', args: { mealOption } },
      capability: 'changeMeal',
      value: mealOption,
    })),
    ...VOICE_EXTRA_OPTIONS.flatMap((extraOption): DispatchCase[] => [
      {
        command: { version: 1, command: 'ADD_OPTION', args: { extraOption } },
        capability: 'addOption',
        value: extraOption,
      },
      {
        command: { version: 1, command: 'REMOVE_OPTION', args: { extraOption } },
        capability: 'removeOption',
        value: extraOption,
      },
    ]),
  ];

  it.each(catalogCases)('forwards $command.command / $value unchanged', (testCase) => {
    const spies = capabilitySpies();
    expect(executeVoiceCommand(testCase.command, spies).ok).toBe(true);
    expect(spies[testCase.capability]).toHaveBeenCalledExactlyOnceWith(testCase.value);
  });

  it('fails safely for an impossible runtime command and ignores arbitrary port methods', () => {
    const spies = capabilitySpies();
    const submitReservation = vi.fn();
    const impossible = { version: 1, command: 'SUBMIT_RESERVATION', args: {} };
    const result = executeVoiceCommand(impossible as VoiceCommand, {
      ...spies,
      ...{ submitReservation },
    });
    expect(result).toEqual({
      ok: false,
      command: 'SUBMIT_RESERVATION',
      error: { code: 'CAPABILITY_FAILED' },
    });
    expect(submitReservation).not.toHaveBeenCalled();
    for (const spy of Object.values(spies)) expect(spy).not.toHaveBeenCalled();
  });

  it('never accesses browser, network, storage, or navigation APIs', () => {
    const forbidden = vi.fn(() => {
      throw new Error('forbidden effect');
    });
    const browser = Object.defineProperties(
      {},
      Object.fromEntries(
        ['localStorage', 'sessionStorage', 'indexedDB', 'location', 'history'].map((name) => [
          name,
          { get: forbidden },
        ]),
      ),
    );
    for (const name of [
      'fetch',
      'XMLHttpRequest',
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'history',
    ]) {
      vi.stubGlobal(name, forbidden);
    }
    vi.stubGlobal('window', browser);
    for (const testCase of Object.values(cases)) {
      expect(executeVoiceCommand(testCase.command, capabilitySpies()).ok).toBe(true);
      expect(executeVoiceCommand(testCase.command, {}).ok).toBe(false);
    }
    expect(forbidden).not.toHaveBeenCalled();
  });

  it('production source imports only canonical Voice types and exposes no submission surface', () => {
    const source = readFileSync(new URL('./voiceCommandBridge.ts', import.meta.url), 'utf8');
    const barrel = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
    expect([...source.matchAll(/from ['"]([^'"]+)['"]/g)].map((match) => match[1])).toEqual([
      '../../integrations/voice/voiceCommand',
    ]);
    expect(source).toMatch(/^import type \{/);
    expect([...barrel.matchAll(/from ['"]([^'"]+)['"]/g)].map((match) => match[1])).toEqual([
      './voiceCommandBridge',
    ]);
    expect(source + barrel).not.toMatch(
      /ReservationDraft|ReservationDraftAction|submitReservation|createReservation|postReservation|confirmReservation|SUBMIT_RESERVATION|\/api\/v1\/reservations|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|window\.|router|React|String\(|\.toString\(/,
    );
  });
});
