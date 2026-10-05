import { type VoiceCommand } from './voiceCommand';
import { decodeVoiceCommand } from './voiceCommandDecoder';
import {
  THEME_ALIASES,
  STYLE_ALIASES,
  HOTEL_ALIASES,
  TRANSPORT_ALIASES,
  MEAL_ALIASES,
  EXTRA_ALIASES,
  COUNT_WORDS,
  UNSUPPORTED_PHRASES,
} from './voiceLexicon';
import { normalizeVoiceTranscript } from './voiceTranscriptNormalizer';

export type VoiceInterpretationResult =
  | { ok: true; normalizedTranscript: string; command: VoiceCommand }
  | {
      ok: false;
      normalizedTranscript: string;
      error: {
        code:
          | 'EMPTY_TRANSCRIPT'
          | 'UNRECOGNIZED'
          | 'AMBIGUOUS'
          | 'UNSUPPORTED_INTENT'
          | 'INVALID_ARGUMENT'
          | 'INTERNAL_CONTRACT_MISMATCH';
        message: string;
      };
    };

type ErrorCode = Extract<VoiceInterpretationResult, { ok: false }>['error']['code'];
type Phrase = { transcript: string; command: VoiceCommand };

/** 내부의 정적 phrase 목록은 collision audit에도 사용하며 barrel API로 노출하지 않는다. */
export const VOICE_PHRASES: readonly Phrase[] = buildPhrases();

/** 전체 문장 일치만 허용한다. 문맥/동적 이름/복수 action은 추측하지 않는다. */
export function interpretVoiceTranscript(transcript: string): VoiceInterpretationResult {
  const normalized = normalizeVoiceTranscript(transcript);
  if (!normalized) return failure(normalized, 'EMPTY_TRANSCRIPT');
  if (hasUnsupportedIntent(normalized)) return failure(normalized, 'UNSUPPORTED_INTENT');

  const candidates: VoiceCommand[] = VOICE_PHRASES.filter(
    (phrase) => phrase.transcript === normalized,
  ).map((phrase) => phrase.command);
  let invalidArgument = false;

  // 숫자 구문만 제한적으로 캡처한다. parseInt/parseFloat의 부분 파싱은 금지한다.
  const product =
    /^(?:상품(?: 아이디)?|투어) ([+\-\d.,e]+) 선택$|^select product ([+\-\d.,e]+)$/.exec(
      normalized,
    );
  const schedule =
    /^(?:일정(?: 아이디)?|스케줄) ([+\-\d.,e]+) 선택$|^select schedule ([+\-\d.,e]+)$/.exec(
      normalized,
    );
  for (const [match, command] of [
    [product, 'SELECT_TOUR_PRODUCT'],
    [schedule, 'SELECT_SCHEDULE'],
  ] as const) {
    if (!match) continue;
    const token = match[1] ?? match[2] ?? '';
    const id = parseInteger(token);
    if (id === undefined) invalidArgument = true;
    else if (command === 'SELECT_TOUR_PRODUCT') {
      candidates.push({ version: 1, command, args: { tourProductId: id } });
    } else {
      candidates.push({ version: 1, command, args: { scheduleId: id } });
    }
  }

  const countWords = Object.keys(COUNT_WORDS).join('|');
  const count = new RegExp(
    `^(?:인원 )?([+\\-\\d.,e]+|${countWords}) ?명(?:으로 설정)?$|^set participants ([+\\-\\d.,e]+)$`,
  ).exec(normalized);
  if (count) {
    const token = count[1] ?? count[2] ?? '';
    const participantCount = Object.hasOwn(COUNT_WORDS, token)
      ? COUNT_WORDS[token]
      : parseInteger(token);
    // 인원 접두사 또는 설정 동사가 있어야 한다. 단독 수량은 action이 아니다.
    const hasAction =
      normalized.startsWith('인원 ') ||
      normalized.endsWith('으로 설정') ||
      normalized.startsWith('set participants ');
    if (hasAction) {
      if (participantCount === undefined || participantCount > 10) invalidArgument = true;
      else
        candidates.push({
          version: 1,
          command: 'SET_PARTICIPANT_COUNT',
          args: { participantCount },
        });
    }
  }

  if (invalidArgument) return failure(normalized, 'INVALID_ARGUMENT');
  return resolveVoiceCandidates(normalized, candidates);
}

/** 내부 gate: 중복을 canonical 구조로 제거한 뒤 반드시 V1 decoder로 검증한다. */
export function resolveVoiceCandidates(
  normalizedTranscript: string,
  candidates: readonly unknown[],
): VoiceInterpretationResult {
  const commands = new Map<string, VoiceCommand>();
  for (const candidate of candidates) {
    const decoded = decodeVoiceCommand(candidate);
    if (!decoded.ok) return failure(normalizedTranscript, 'INTERNAL_CONTRACT_MISMATCH');
    commands.set(JSON.stringify(decoded.value), decoded.value);
  }
  if (commands.size === 0) return failure(normalizedTranscript, 'UNRECOGNIZED');
  if (commands.size > 1) return failure(normalizedTranscript, 'AMBIGUOUS');
  for (const command of commands.values()) return { ok: true, normalizedTranscript, command };
  return failure(normalizedTranscript, 'UNRECOGNIZED');
}

function failure(normalizedTranscript: string, code: ErrorCode): VoiceInterpretationResult {
  return {
    ok: false,
    normalizedTranscript,
    error: { code, message: `Voice interpretation failed: ${code}.` },
  };
}

function parseInteger(token: string): number | undefined {
  if (!/^\d+$/.test(token)) return undefined;
  const value = Number(token);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function hasUnsupportedIntent(transcript: string): boolean {
  return UNSUPPORTED_PHRASES.some((phrase) => {
    if (/[a-z]/.test(phrase)) {
      // English keywords match tokens, so "payment" cannot accidentally match "pay" prefixes.
      return new RegExp(`(?:^|[^a-z0-9])${phrase}(?:$|[^a-z0-9])`).test(transcript);
    }
    return transcript.includes(phrase);
  });
}

function buildPhrases(): Phrase[] {
  const phrases: Phrase[] = [];
  const add = (transcripts: readonly string[], command: VoiceCommand) => {
    for (const transcript of transcripts) {
      phrases.push({ transcript: normalizeVoiceTranscript(transcript), command });
    }
  };
  add(['여행 상품 보여줘', '상품 보여줘', '투어 보여줘', 'show tours'], {
    version: 1,
    command: 'SHOW_TOURS',
    args: {},
  });
  for (const theme of Object.keys(THEME_ALIASES) as (keyof typeof THEME_ALIASES)[]) {
    for (const alias of THEME_ALIASES[theme]) {
      add([`${alias} 상품 보여줘`, `${alias} 여행 상품 보여줘`, `show ${alias} tours`], {
        version: 1,
        command: 'SHOW_TOURS',
        args: { theme },
      });
      add([`${alias} 테마 선택`, `${alias} 테마로 변경`, `select theme ${alias}`], {
        version: 1,
        command: 'SELECT_THEME',
        args: { theme },
      });
    }
  }
  for (const style of Object.keys(STYLE_ALIASES) as (keyof typeof STYLE_ALIASES)[]) {
    for (const alias of STYLE_ALIASES[style]) {
      add([`${alias} 스타일 선택`, `${alias} 등급 선택`, `select style ${alias}`], {
        version: 1,
        command: 'SELECT_STYLE',
        args: { style },
      });
    }
  }
  for (const hotelOption of Object.keys(HOTEL_ALIASES) as (keyof typeof HOTEL_ALIASES)[]) {
    for (const alias of HOTEL_ALIASES[hotelOption]) {
      add(
        [
          `호텔 ${alias} 선택`,
          `호텔 ${alias}로 변경`,
          `${alias} 호텔로 변경`,
          `change hotel ${alias}`,
        ],
        { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption } },
      );
    }
  }
  for (const transportOption of Object.keys(
    TRANSPORT_ALIASES,
  ) as (keyof typeof TRANSPORT_ALIASES)[]) {
    for (const alias of TRANSPORT_ALIASES[transportOption]) {
      add(
        [
          `차량 ${alias} 선택`,
          `차량 ${alias}으로 변경`,
          `${alias} 차량으로 변경`,
          `change transport ${alias}`,
        ],
        { version: 1, command: 'CHANGE_TRANSPORT', args: { transportOption } },
      );
    }
  }
  for (const mealOption of Object.keys(MEAL_ALIASES) as (keyof typeof MEAL_ALIASES)[]) {
    for (const alias of MEAL_ALIASES[mealOption]) {
      add(
        [
          `식사 ${alias} 선택`,
          `식사 ${alias}로 변경`,
          `${alias} 식사로 변경`,
          `change meal ${alias}`,
        ],
        { version: 1, command: 'CHANGE_MEAL', args: { mealOption } },
      );
    }
  }
  for (const extraOption of Object.keys(EXTRA_ALIASES) as (keyof typeof EXTRA_ALIASES)[]) {
    for (const alias of EXTRA_ALIASES[extraOption]) {
      add([`${alias} 추가`, `옵션 ${alias} 추가`, `add option ${alias}`], {
        version: 1,
        command: 'ADD_OPTION',
        args: { extraOption },
      });
      add([`${alias} 제거`, `옵션 ${alias} 제거`, `${alias} 빼줘`, `remove option ${alias}`], {
        version: 1,
        command: 'REMOVE_OPTION',
        args: { extraOption },
      });
    }
  }
  return phrases;
}
