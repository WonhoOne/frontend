// @vitest-environment node
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  normalizeVoiceTranscript,
  interpretVoiceTranscript,
  decodeVoiceCommand,
  VOICE_COMMAND_NAMES,
  type VoiceCommand,
  type VoiceInterpretationResult,
} from './index';
import { VOICE_PHRASES, resolveVoiceCandidates } from './voiceCommandInterpreter';
import { COUNT_WORDS, UNSUPPORTED_PHRASES } from './voiceLexicon';

function success(transcript: string, command: VoiceCommand): void {
  const result = interpretVoiceTranscript(transcript);
  expect(result).toEqual({
    ok: true,
    normalizedTranscript: normalizeVoiceTranscript(transcript),
    command,
  });
  if (result.ok) expect(decodeVoiceCommand(result.command)).toEqual({ ok: true, value: command });
}

function failure(
  transcript: string,
  code: Extract<VoiceInterpretationResult, { ok: false }>['error']['code'],
): void {
  const result = interpretVoiceTranscript(transcript);
  expect(result).toMatchObject({
    ok: false,
    normalizedTranscript: normalizeVoiceTranscript(transcript),
    error: { code },
  });
  expect(result).not.toHaveProperty('command');
}

describe('deterministic transcript normalization', () => {
  it.each([
    ['  상품 보여줘  ', '상품 보여줘'],
    ['show\t\n  tours', 'show tours'],
    ['SHOW TOURS', 'show tours'],
    ['ＳＨＯＷ　ＴＯＵＲＳ！', 'show tours'],
    ['상품,보여줘!?', '상품 보여줘'],
    ['인원 4 명', '인원 4명'],
    ['호텔 3 성급 선택', '호텔 3성급 선택'],
    ['차량 2 인 고급차량 선택', '차량 2인 고급차량 선택'],
    ['상품 -1 선택', '상품 -1 선택'],
    ['상품 −1 선택', '상품 −1 선택'],
    ['상품 –1 선택', '상품 –1 선택'],
    ['상품 1.5 선택', '상품 1.5 선택'],
    ['상품 .5 선택', '상품 .5 선택'],
    ['상품 1,000 선택', '상품 1,000 선택'],
    ['골푸 테마 선택', '골푸 테마 선택'],
  ])('normalizes %s conservatively', (raw, normalized) => {
    expect(normalizeVoiceTranscript(raw)).toBe(normalized);
    expect(normalizeVoiceTranscript(raw)).toBe(normalizeVoiceTranscript(raw));
    expect(normalizeVoiceTranscript(normalized)).toBe(normalized);
  });

  it.each(['', '  \t\n ', '!?.,;:—()[]{} + - / ★'])('rejects empty input %s', (raw) => {
    failure(raw, 'EMPTY_TRANSCRIPT');
  });
});

describe('static phrase collision audit and V1 integration', () => {
  const examples: readonly [string, VoiceCommand][] = [
    ['상품 보여줘', { version: 1, command: 'SHOW_TOURS', args: {} }],
    [
      '허니문 테마 선택',
      { version: 1, command: 'SELECT_THEME', args: { theme: 'HONEYMOON_ROMANCE' } },
    ],
    [
      '부모님 여행 상품 보여줘',
      { version: 1, command: 'SHOW_TOURS', args: { theme: 'PARENTS_HEALING' } },
    ],
    ['골프 테마 선택', { version: 1, command: 'SELECT_THEME', args: { theme: 'GOLF_CHALLENGE' } }],
    [
      'select theme trekking',
      { version: 1, command: 'SELECT_THEME', args: { theme: 'OUTDOOR_TREKKING' } },
    ],
    ['상품 12 선택', { version: 1, command: 'SELECT_TOUR_PRODUCT', args: { tourProductId: 12 } }],
    ['일정 31 선택', { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 31 } }],
    ['클래식 스타일 선택', { version: 1, command: 'SELECT_STYLE', args: { style: 'CLASSIC' } }],
    ['그랜드 등급 선택', { version: 1, command: 'SELECT_STYLE', args: { style: 'GRAND' } }],
    ['select style premium', { version: 1, command: 'SELECT_STYLE', args: { style: 'PREMIUM' } }],
    ['인원 3명', { version: 1, command: 'SET_PARTICIPANT_COUNT', args: { participantCount: 3 } }],
    [
      '호텔 3성급 선택',
      { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption: 'HOTEL_3_STAR' } },
    ],
    [
      '4성급 호텔로 변경',
      { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption: 'HOTEL_4_STAR' } },
    ],
    [
      'change hotel 5 star hotel',
      { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption: 'HOTEL_5_STAR' } },
    ],
    [
      '차량 2인 고급차량 선택',
      {
        version: 1,
        command: 'CHANGE_TRANSPORT',
        args: { transportOption: 'PRIVATE_LUXURY_CAR_2' },
      },
    ],
    [
      'change transport premium van',
      { version: 1, command: 'CHANGE_TRANSPORT', args: { transportOption: 'PREMIUM_VAN_10' } },
    ],
    [
      '도시락 식사로 변경',
      { version: 1, command: 'CHANGE_MEAL', args: { mealOption: 'LUNCH_BOX' } },
    ],
    [
      '식사 현지식 레스토랑 선택',
      { version: 1, command: 'CHANGE_MEAL', args: { mealOption: 'LOCAL_RESTAURANT' } },
    ],
    [
      'change meal premium restaurant',
      { version: 1, command: 'CHANGE_MEAL', args: { mealOption: 'PREMIUM_RESTAURANT' } },
    ],
    ['샴페인 추가', { version: 1, command: 'ADD_OPTION', args: { extraOption: 'CHAMPAGNE' } }],
    ['샴페인 제거', { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'CHAMPAGNE' } }],
    ['옵션 커피 추가', { version: 1, command: 'ADD_OPTION', args: { extraOption: 'COFFEE' } }],
    ['커피 빼줘', { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'COFFEE' } }],
  ];
  it.each(examples)('locks independent expected meaning for %s', (transcript, command) => {
    success(transcript, command);
  });
  it.each(VOICE_PHRASES)(
    '$transcript yields exactly its canonical command',
    ({ transcript, command }) => {
      success(transcript, command);
    },
  );

  it('covers all eleven commands without introducing shared commands', () => {
    const covered = new Set(VOICE_PHRASES.map(({ command }) => command.command));
    covered.add('SELECT_TOUR_PRODUCT');
    covered.add('SELECT_SCHEDULE');
    covered.add('SET_PARTICIPANT_COUNT');
    expect([...covered].sort()).toEqual([...VOICE_COMMAND_NAMES].sort());
    expect(VOICE_COMMAND_NAMES).toHaveLength(11);
  });

  it('deduplicates structurally identical candidates through the decoder', () => {
    const command: VoiceCommand = { version: 1, command: 'SHOW_TOURS', args: {} };
    expect(resolveVoiceCandidates('show tours', [command, { ...command, args: {} }])).toEqual({
      ok: true,
      normalizedTranscript: 'show tours',
      command,
    });
  });

  it('reports synthetic distinct-command collisions and carries no command', () => {
    const result = resolveVoiceCandidates('collision', [
      { version: 1, command: 'ADD_OPTION', args: { extraOption: 'COFFEE' } },
      { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'COFFEE' } },
    ]);
    expect(result).toMatchObject({ ok: false, error: { code: 'AMBIGUOUS' } });
    expect(result).not.toHaveProperty('command');
    expectTypeOf<Extract<VoiceInterpretationResult, { ok: false }>['error']['code']>()
      .extract<'AMBIGUOUS'>()
      .toEqualTypeOf<'AMBIGUOUS'>();
  });

  it('reports internal V1 contract mismatch without throwing', () => {
    expect(
      resolveVoiceCandidates('internal', [
        { version: 1, command: 'SHOW_TOURS', args: { theme: 'UNKNOWN' } },
      ]),
    ).toMatchObject({ ok: false, error: { code: 'INTERNAL_CONTRACT_MISMATCH' } });
  });
});

describe.each([
  {
    command: 'SELECT_TOUR_PRODUCT',
    key: 'tourProductId',
    templates: ['상품 # 선택', '투어 # 선택', '상품 아이디 # 선택', 'select product #'],
  },
  {
    command: 'SELECT_SCHEDULE',
    key: 'scheduleId',
    templates: ['일정 # 선택', '스케줄 # 선택', '일정 아이디 # 선택', 'select schedule #'],
  },
] as const)('$command numeric identity', ({ command, key, templates }) => {
  it.each([1, 12, 31, Number.MAX_SAFE_INTEGER])(
    'accepts positive safe integer %s in every template',
    (id) => {
      for (const template of templates) {
        const expected = { version: 1, command, args: { [key]: id } };
        const result = interpretVoiceTranscript(template.replace('#', String(id)));
        expect(result).toMatchObject({ ok: true, command: expected });
        if (result.ok) expect(decodeVoiceCommand(result.command).ok).toBe(true);
      }
    },
  );

  it.each([
    '0',
    '-1',
    '+1',
    '1.5',
    '.5',
    '1,000',
    '1e2',
    '9007199254740992',
    '9999999999999999999999999999',
  ])('rejects invalid numeric argument %s', (token) => {
    for (const template of templates) failure(template.replace('#', token), 'INVALID_ARGUMENT');
  });

  it.each([
    '1 2',
    '- 1',
    '-!1',
    '. 5',
    '−1',
    '–1',
    '1/2',
    '12abc',
    'NaN',
    'Infinity',
    '제주 골프 여행',
    '2026-11-10',
  ])('does not partially parse or guess %s', (token) => {
    for (const template of templates)
      expect(interpretVoiceTranscript(template.replace('#', token)).ok).toBe(false);
  });
});

describe('participantCount is context-free', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
    'accepts %s including odd counts',
    (participantCount) => {
      for (const transcript of [
        `인원 ${participantCount}명`,
        `인원 ${participantCount} 명으로 설정`,
        `${participantCount}명으로 설정`,
        `set participants ${participantCount}`,
      ]) {
        success(transcript, {
          version: 1,
          command: 'SET_PARTICIPANT_COUNT',
          args: { participantCount },
        });
      }
    },
  );

  it.each(Object.entries(COUNT_WORDS))(
    'accepts explicit Korean word %s',
    (word, participantCount) => {
      for (const transcript of [
        `인원 ${word} 명`,
        `${word} 명으로 설정`,
        `인원 ${word} 명으로 설정`,
      ]) {
        success(transcript, {
          version: 1,
          command: 'SET_PARTICIPANT_COUNT',
          args: { participantCount },
        });
      }
    },
  );

  it.each(['0', '11', '-1', '+4', '1.5', '.5', '1,000', '1e1', '99999999999999999'])(
    'rejects %s',
    (token) => {
      failure(`인원 ${token}명`, 'INVALID_ARGUMENT');
      failure(`set participants ${token}`, 'INVALID_ARGUMENT');
    },
  );

  it.each(['인원 1 2명', '인원 네다섯 명', '인원 삼 명', 'set participants four', '4명', '네 명'])(
    'does not infer %s',
    (transcript) => {
      failure(transcript, 'UNRECOGNIZED');
    },
  );
});

describe('unsupported intent takes precedence', () => {
  it.each(UNSUPPORTED_PHRASES)('guards %s alone and mixed with supported actions', (phrase) => {
    failure(phrase, 'UNSUPPORTED_INTENT');
    failure(`상품 보여줘 ${phrase}`, 'UNSUPPORTED_INTENT');
    failure(`${phrase} 커피 추가`, 'UNSUPPORTED_INTENT');
  });

  it.each(['display', 'repayment', 'research', 'searching', 'payday'])(
    'does not substring-match English token %s',
    (transcript) => {
      failure(transcript, 'UNRECOGNIZED');
    },
  );
});

describe('unrecognized transcripts have no authority', () => {
  it.each([
    '오늘 날씨가 좋아',
    '골프',
    '프리미엄 선택',
    '커피',
    '선택',
    '호텔 선택',
    '우주 여행 상품 보여줘',
    '골푸 테마 선택',
    '상품 제주 여행 선택',
    '일정 다음주 선택',
    '커피 추가 샴페인 제거',
    '<script>alert(1)</script>',
    'constructor',
    '__proto__',
  ])('does not guess or execute %s', (transcript) => {
    failure(transcript, 'UNRECOGNIZED');
  });

  it('works without browser DOM and returns independent data on every call', () => {
    expect(typeof window).toBe('undefined');
    const first = interpretVoiceTranscript('커피 추가');
    if (first.ok && first.command.command === 'ADD_OPTION')
      first.command.args.extraOption = 'CHAMPAGNE';
    success('커피 추가', { version: 1, command: 'ADD_OPTION', args: { extraOption: 'COFFEE' } });
  });
});
