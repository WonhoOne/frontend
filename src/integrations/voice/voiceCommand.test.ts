import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  decodeVoiceCommand,
  VOICE_COMMAND_NAMES,
  VOICE_THEMES,
  VOICE_TOUR_STYLES,
  VOICE_HOTEL_OPTIONS,
  VOICE_TRANSPORT_OPTIONS,
  VOICE_MEAL_OPTIONS,
  VOICE_EXTRA_OPTIONS,
  type VoiceCommand,
  type VoiceCommandName,
} from '@/integrations/voice';

const commands = {
  SHOW_TOURS: { version: 1, command: 'SHOW_TOURS', args: {} },
  SELECT_THEME: { version: 1, command: 'SELECT_THEME', args: { theme: 'GOLF_CHALLENGE' } },
  SELECT_TOUR_PRODUCT: { version: 1, command: 'SELECT_TOUR_PRODUCT', args: { tourProductId: 1 } },
  SELECT_STYLE: { version: 1, command: 'SELECT_STYLE', args: { style: 'CLASSIC' } },
  SELECT_SCHEDULE: { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 1 } },
  SET_PARTICIPANT_COUNT: {
    version: 1,
    command: 'SET_PARTICIPANT_COUNT',
    args: { participantCount: 1 },
  },
  CHANGE_HOTEL: { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption: 'HOTEL_3_STAR' } },
  CHANGE_TRANSPORT: {
    version: 1,
    command: 'CHANGE_TRANSPORT',
    args: { transportOption: 'PRIVATE_LUXURY_CAR_2' },
  },
  CHANGE_MEAL: { version: 1, command: 'CHANGE_MEAL', args: { mealOption: 'LUNCH_BOX' } },
  ADD_OPTION: { version: 1, command: 'ADD_OPTION', args: { extraOption: 'CHAMPAGNE' } },
  REMOVE_OPTION: { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'COFFEE' } },
} satisfies { [Name in VoiceCommandName]: Extract<VoiceCommand, { command: Name }> };

const valueFamilies = [
  {
    command: 'SELECT_THEME',
    key: 'theme',
    values: VOICE_THEMES,
    expected: ['HONEYMOON_ROMANCE', 'PARENTS_HEALING', 'GOLF_CHALLENGE', 'OUTDOOR_TREKKING'],
  },
  {
    command: 'SELECT_STYLE',
    key: 'style',
    values: VOICE_TOUR_STYLES,
    expected: ['CLASSIC', 'GRAND', 'PREMIUM'],
  },
  {
    command: 'CHANGE_HOTEL',
    key: 'hotelOption',
    values: VOICE_HOTEL_OPTIONS,
    expected: ['HOTEL_3_STAR', 'HOTEL_4_STAR', 'HOTEL_5_STAR'],
  },
  {
    command: 'CHANGE_TRANSPORT',
    key: 'transportOption',
    values: VOICE_TRANSPORT_OPTIONS,
    expected: ['PRIVATE_LUXURY_CAR_2', 'PREMIUM_VAN_10'],
  },
  {
    command: 'CHANGE_MEAL',
    key: 'mealOption',
    values: VOICE_MEAL_OPTIONS,
    expected: ['LUNCH_BOX', 'LOCAL_RESTAURANT', 'PREMIUM_RESTAURANT'],
  },
  {
    command: 'ADD_OPTION',
    key: 'extraOption',
    values: VOICE_EXTRA_OPTIONS,
    expected: ['CHAMPAGNE', 'COFFEE'],
  },
  {
    command: 'REMOVE_OPTION',
    key: 'extraOption',
    values: VOICE_EXTRA_OPTIONS,
    expected: ['CHAMPAGNE', 'COFFEE'],
  },
];

function payload(command: string, args: unknown): unknown {
  return { version: 1, command, args };
}

describe('canonical VoiceCommand v1 contract', () => {
  it('exports exactly the eleven approved commands and no submit capability', () => {
    expect(VOICE_COMMAND_NAMES).toEqual([
      'SHOW_TOURS',
      'SELECT_THEME',
      'SELECT_TOUR_PRODUCT',
      'SELECT_STYLE',
      'SELECT_SCHEDULE',
      'SET_PARTICIPANT_COUNT',
      'CHANGE_HOTEL',
      'CHANGE_TRANSPORT',
      'CHANGE_MEAL',
      'ADD_OPTION',
      'REMOVE_OPTION',
    ]);
    expectTypeOf<VoiceCommand['command']>().toEqualTypeOf<VoiceCommandName>();
    expectTypeOf<Extract<VoiceCommandName, 'SUBMIT_RESERVATION'>>().toEqualTypeOf<never>();
    expectTypeOf<Extract<VoiceCommand, { command: 'SELECT_THEME' }>['args']>().toEqualTypeOf<{
      theme: (typeof VOICE_THEMES)[number];
    }>();
  });

  it.each(Object.values(commands))(
    'decodes $command without transcript or confidence',
    (command) => {
      expect(decodeVoiceCommand(command)).toEqual({ ok: true, value: command });
    },
  );

  it('accepts SHOW_TOURS with no theme or any canonical theme', () => {
    expect(decodeVoiceCommand(payload('SHOW_TOURS', {}))).toEqual({
      ok: true,
      value: commands.SHOW_TOURS,
    });
    for (const theme of VOICE_THEMES) {
      const input = payload('SHOW_TOURS', { theme });
      expect(decodeVoiceCommand(input)).toEqual({ ok: true, value: input });
    }
  });

  it.each([undefined, null, '', 'UNKNOWN', 'golf_challenge'])(
    'rejects an explicitly invalid SHOW_TOURS theme: %s',
    (theme) => {
      expect(decodeVoiceCommand(payload('SHOW_TOURS', { theme }))).toMatchObject({
        ok: false,
        error: { code: 'INVALID_ARG', path: 'args.theme' },
      });
    },
  );

  describe.each(valueFamilies)(
    '$command canonical values',
    ({ command, key, values, expected }) => {
      it('locks the approved value set and accepts each exact value', () => {
        expect(values).toEqual(expected);
        for (const value of values) {
          const input = payload(command, { [key]: value });
          expect(decodeVoiceCommand(input)).toEqual({ ok: true, value: input });
        }
      });

      it.each(['UNKNOWN', '', null, undefined, 1, false, [], {}])(
        'rejects a noncanonical value: %s',
        (value) => {
          expect(decodeVoiceCommand(payload(command, { [key]: value }))).toMatchObject({
            ok: false,
            error: { code: 'INVALID_ARG', path: `args.${key}` },
          });
        },
      );

      it('does not trim, normalize case, or match synonyms', () => {
        for (const value of values) {
          for (const malformed of [value.toLowerCase(), ` ${value} `]) {
            expect(decodeVoiceCommand(payload(command, { [key]: malformed })).ok).toBe(false);
          }
        }
      });
    },
  );

  it.each([0, 2, -1, 1.5, '1', undefined, null, NaN, Infinity])('rejects version %s', (version) => {
    expect(decodeVoiceCommand({ ...commands.SHOW_TOURS, version })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_VERSION', path: 'version' },
    });
  });

  it.each([
    'UNKNOWN',
    'SUBMIT_RESERVATION',
    'LOGIN',
    'SIGNUP',
    'CANCEL_RESERVATION',
    'REFUND',
    'PAYMENT',
    'RECOMMEND',
    'SEARCH',
    'EMPLOYEE_MUTATION',
    'show_tours',
    '',
    undefined,
    null,
    1,
    {},
    [],
  ])('rejects unsupported command %s', (command) => {
    expect(decodeVoiceCommand({ version: 1, command, args: {} })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_COMMAND', path: 'command' },
    });
  });

  describe.each([
    { command: 'SELECT_TOUR_PRODUCT', key: 'tourProductId' },
    { command: 'SELECT_SCHEDULE', key: 'scheduleId' },
  ])('$command resource identity', ({ command, key }) => {
    it.each([1, 42, Number.MAX_SAFE_INTEGER])('accepts positive safe integer %s', (id) => {
      const input = payload(command, { [key]: id });
      expect(decodeVoiceCommand(input)).toEqual({ ok: true, value: input });
    });

    it.each([
      0,
      -1,
      1.5,
      NaN,
      Infinity,
      -Infinity,
      '1',
      Number.MAX_SAFE_INTEGER + 1,
      null,
      undefined,
      true,
      1n,
    ])('rejects invalid resource ID %s without coercion', (id) => {
      expect(decodeVoiceCommand(payload(command, { [key]: id }))).toMatchObject({
        ok: false,
        error: { code: 'INVALID_ARG', path: `args.${key}` },
      });
    });
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
    'accepts context-free participantCount %s, including odd counts',
    (participantCount) => {
      const input = payload('SET_PARTICIPANT_COUNT', { participantCount });
      expect(decodeVoiceCommand(input)).toEqual({ ok: true, value: input });
    },
  );

  it.each([0, -1, 11, 1.5, '1', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, null, undefined])(
    'rejects invalid participantCount %s',
    (participantCount) => {
      expect(
        decodeVoiceCommand(payload('SET_PARTICIPANT_COUNT', { participantCount })),
      ).toMatchObject({
        ok: false,
        error: { code: 'INVALID_ARG', path: 'args.participantCount' },
      });
    },
  );

  it.each(VOICE_COMMAND_NAMES.filter((command) => command !== 'SHOW_TOURS'))(
    'rejects missing required args for %s',
    (command) => {
      expect(decodeVoiceCommand(payload(command, {}))).toMatchObject({
        ok: false,
        error: { code: 'INVALID_ARG' },
      });
    },
  );

  it.each(Object.values(commands))(
    'rejects wrong-command and extra args for $command',
    (command) => {
      const wrongArgs =
        command.command === 'SELECT_SCHEDULE' ? { theme: 'GOLF_CHALLENGE' } : { scheduleId: 1 };
      expect(decodeVoiceCommand({ ...command, args: wrongArgs })).toMatchObject({
        ok: false,
        error: { code: 'UNEXPECTED_KEY' },
      });
      expect(
        decodeVoiceCommand({ ...command, args: { ...command.args, unsupported: true } }),
      ).toMatchObject({ ok: false, error: { code: 'UNEXPECTED_KEY', path: 'args.unsupported' } });
    },
  );

  it.each(['rawTranscript', 'confidence', 'unsupported'])(
    'rejects envelope extra key %s',
    (key) => {
      expect(decodeVoiceCommand({ ...commands.SHOW_TOURS, [key]: 'extra' })).toMatchObject({
        ok: false,
        error: { code: 'UNEXPECTED_KEY', path: key },
      });
    },
  );

  const malformedInputs: unknown[] = [
    null,
    undefined,
    [],
    'SHOW_TOURS',
    1,
    true,
    new Date(),
    new Map(),
    {},
    { version: 1 },
    { version: 1, command: 'SHOW_TOURS' },
    ...[null, undefined, [], '', 1, new Date()].map((args) => payload('SHOW_TOURS', args)),
  ];
  it.each(malformedInputs)('rejects malformed envelope without throwing: %s', (input) => {
    expect(() => decodeVoiceCommand(input)).not.toThrow();
    expect(decodeVoiceCommand(input).ok).toBe(false);
  });

  it('rejects inherited fields and custom prototypes', () => {
    const inherited: unknown = Object.create(commands.SELECT_THEME);
    expect(decodeVoiceCommand(inherited).ok).toBe(false);
    const inheritedArgs: unknown = Object.create({ theme: 'GOLF_CHALLENGE' });
    expect(decodeVoiceCommand(payload('SELECT_THEME', inheritedArgs)).ok).toBe(false);
  });

  it('accepts null-prototype plain data objects and returns a fresh canonical payload', () => {
    const args: unknown = Object.assign(Object.create(null) as object, { scheduleId: 42 });
    const input = Object.assign(Object.create(null) as object, {
      version: 1,
      command: 'SELECT_SCHEDULE',
      args,
    });
    const result = decodeVoiceCommand(input);
    expect(result).toEqual({
      ok: true,
      value: { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 42 } },
    });
    if (result.ok) {
      expect(result.value).not.toBe(input);
      expect(result.value.args).not.toBe(args);
    }
  });

  it('rejects symbol and non-enumerable extra keys', () => {
    const input = { ...commands.SHOW_TOURS, [Symbol('extra')]: true };
    expect(decodeVoiceCommand(input).ok).toBe(false);
    const args = Object.defineProperty({}, 'scheduleId', { value: 1 });
    expect(decodeVoiceCommand(payload('SHOW_TOURS', args)).ok).toBe(false);
  });

  it('rejects accessors without executing them or throwing', () => {
    const args = Object.defineProperty({}, 'theme', {
      get() {
        throw new Error('Accessor must not execute');
      },
    });
    expect(() => decodeVoiceCommand(payload('SELECT_THEME', args))).not.toThrow();
    expect(decodeVoiceCommand(payload('SELECT_THEME', args))).toMatchObject({
      ok: false,
      error: { code: 'INVALID_OBJECT', path: 'args' },
    });
  });

  it('does not mutate its input', () => {
    const input = Object.freeze({
      version: 1,
      command: 'SELECT_THEME',
      args: Object.freeze({ theme: 'HONEYMOON_ROMANCE' }),
    });
    expect(decodeVoiceCommand(input)).toEqual({ ok: true, value: input });
    expect(input.args.theme).toBe('HONEYMOON_ROMANCE');
  });
});
