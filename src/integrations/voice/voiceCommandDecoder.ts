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
} from './voiceCommand';

export type VoiceCommandDecodeResult =
  | { ok: true; value: VoiceCommand }
  | {
      ok: false;
      error: {
        code:
          | 'INVALID_OBJECT'
          | 'INVALID_VERSION'
          | 'INVALID_COMMAND'
          | 'UNEXPECTED_KEY'
          | 'INVALID_ARG';
        path: string;
        message: string;
      };
    };

const ARG_KEYS = {
  SHOW_TOURS: 'theme',
  SELECT_THEME: 'theme',
  SELECT_TOUR_PRODUCT: 'tourProductId',
  SELECT_STYLE: 'style',
  SELECT_SCHEDULE: 'scheduleId',
  SET_PARTICIPANT_COUNT: 'participantCount',
  CHANGE_HOTEL: 'hotelOption',
  CHANGE_TRANSPORT: 'transportOption',
  CHANGE_MEAL: 'mealOption',
  ADD_OPTION: 'extraOption',
  REMOVE_OPTION: 'extraOption',
} as const satisfies Record<VoiceCommandName, string>;

/**
 * canonical payload만 검증하며 coercion, 해석 또는 부수 효과를 수행하지 않는다.
 * participantCount는 공통 1..10 범위만 검사한다. Honeymoon/Theme/차량/일정 등
 * 문맥 검증은 Feature/Backend 경계에 남으며 Backend가 최종 Business Rule 권한을 가진다.
 */
export function decodeVoiceCommand(input: unknown): VoiceCommandDecodeResult {
  if (!isPlainDataObject(input)) {
    return failure('INVALID_OBJECT', '$', 'Voice command must be a plain data object.');
  }
  const envelopeExtraKey = unexpectedKey(input, ['version', 'command', 'args']);
  if (envelopeExtraKey !== undefined) {
    return failure('UNEXPECTED_KEY', envelopeExtraKey, 'Unexpected envelope key.');
  }
  if (input.version !== 1) {
    return failure('INVALID_VERSION', 'version', 'Voice command version must be number 1.');
  }
  if (!isCanonicalValue(input.command, VOICE_COMMAND_NAMES)) {
    return failure('INVALID_COMMAND', 'command', 'Unsupported canonical command.');
  }
  if (!isPlainDataObject(input.args)) {
    return failure('INVALID_OBJECT', 'args', 'Command args must be a plain data object.');
  }

  const command = input.command;
  const args = input.args;
  const argsExtraKey = unexpectedKey(args, [ARG_KEYS[command]]);
  if (argsExtraKey !== undefined) {
    return failure('UNEXPECTED_KEY', `args.${argsExtraKey}`, 'Unexpected command arg.');
  }

  switch (command) {
    case 'SHOW_TOURS':
      // theme 생략과 명시된 잘못된 값(undefined 포함)을 구분한다.
      if (!Object.hasOwn(args, 'theme')) {
        return { ok: true, value: { version: 1, command, args: {} } };
      }
      if (isCanonicalValue(args.theme, VOICE_THEMES)) {
        return { ok: true, value: { version: 1, command, args: { theme: args.theme } } };
      }
      return invalidArg('theme');
    case 'SELECT_THEME':
      if (isCanonicalValue(args.theme, VOICE_THEMES)) {
        return { ok: true, value: { version: 1, command, args: { theme: args.theme } } };
      }
      return invalidArg('theme');
    case 'SELECT_TOUR_PRODUCT':
      if (isPositiveSafeInteger(args.tourProductId)) {
        return {
          ok: true,
          value: { version: 1, command, args: { tourProductId: args.tourProductId } },
        };
      }
      return invalidArg('tourProductId');
    case 'SELECT_STYLE':
      if (isCanonicalValue(args.style, VOICE_TOUR_STYLES)) {
        return { ok: true, value: { version: 1, command, args: { style: args.style } } };
      }
      return invalidArg('style');
    case 'SELECT_SCHEDULE':
      if (isPositiveSafeInteger(args.scheduleId)) {
        return { ok: true, value: { version: 1, command, args: { scheduleId: args.scheduleId } } };
      }
      return invalidArg('scheduleId');
    case 'SET_PARTICIPANT_COUNT':
      if (isPositiveSafeInteger(args.participantCount) && args.participantCount <= 10) {
        return {
          ok: true,
          value: { version: 1, command, args: { participantCount: args.participantCount } },
        };
      }
      return invalidArg('participantCount');
    case 'CHANGE_HOTEL':
      if (isCanonicalValue(args.hotelOption, VOICE_HOTEL_OPTIONS)) {
        return {
          ok: true,
          value: { version: 1, command, args: { hotelOption: args.hotelOption } },
        };
      }
      return invalidArg('hotelOption');
    case 'CHANGE_TRANSPORT':
      if (isCanonicalValue(args.transportOption, VOICE_TRANSPORT_OPTIONS)) {
        return {
          ok: true,
          value: { version: 1, command, args: { transportOption: args.transportOption } },
        };
      }
      return invalidArg('transportOption');
    case 'CHANGE_MEAL':
      if (isCanonicalValue(args.mealOption, VOICE_MEAL_OPTIONS)) {
        return { ok: true, value: { version: 1, command, args: { mealOption: args.mealOption } } };
      }
      return invalidArg('mealOption');
    case 'ADD_OPTION':
      if (isCanonicalValue(args.extraOption, VOICE_EXTRA_OPTIONS)) {
        return {
          ok: true,
          value: { version: 1, command, args: { extraOption: args.extraOption } },
        };
      }
      return invalidArg('extraOption');
    case 'REMOVE_OPTION':
      if (isCanonicalValue(args.extraOption, VOICE_EXTRA_OPTIONS)) {
        return {
          ok: true,
          value: { version: 1, command, args: { extraOption: args.extraOption } },
        };
      }
      return invalidArg('extraOption');
    default: {
      const exhaustive: never = command;
      return exhaustive;
    }
  }
}

function failure(
  code: Extract<VoiceCommandDecodeResult, { ok: false }>['error']['code'],
  path: string,
  message: string,
): VoiceCommandDecodeResult {
  return { ok: false, error: { code, path, message } };
}

function invalidArg(key: string): VoiceCommandDecodeResult {
  return failure('INVALID_ARG', `args.${key}`, 'Missing or invalid canonical arg.');
}

function isCanonicalValue<Value extends string>(
  input: unknown,
  values: readonly Value[],
): input is Value {
  return typeof input === 'string' && values.some((value) => value === input);
}

function isPositiveSafeInteger(input: unknown): input is number {
  return typeof input === 'number' && Number.isSafeInteger(input) && input > 0;
}

function isPlainDataObject(input: unknown): input is Record<string, unknown> {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }
  // accessor를 실행하지 않고 거부하여 검증 과정의 부수 효과를 방지한다.
  return Reflect.ownKeys(input).every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    return descriptor !== undefined && Object.hasOwn(descriptor, 'value');
  });
}

function unexpectedKey(
  input: Record<string, unknown>,
  allowed: readonly string[],
): string | undefined {
  const key = Reflect.ownKeys(input).find(
    (key) => typeof key !== 'string' || !allowed.includes(key),
  );
  return key === undefined ? undefined : String(key);
}
