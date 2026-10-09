// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  decodeVoiceCommand,
  interpretVoiceTranscript,
  interpretVoiceTranscriptWithContext,
  normalizeVoiceTranscript,
  VOICE_COMMAND_NAMES,
  type VoiceInterpretationContext,
  type VoiceTourScheduleChoice,
} from './index';
import { VOICE_PHRASES } from './voiceCommandInterpreter';
import { UNSUPPORTED_PHRASES } from './voiceLexicon';

const empty: VoiceInterpretationContext = { tourProducts: [], tourSchedules: [] };
const productContext: VoiceInterpretationContext = {
  tourProducts: [{ id: 201, name: '제주 골프 여행' }],
  tourSchedules: [],
};
const schedule: VoiceTourScheduleChoice = {
  id: 501,
  tourProductId: 201,
  startDate: '2026-11-10',
  endDate: '2026-11-14',
};
const scheduleContext: VoiceInterpretationContext = {
  tourProducts: [],
  tourSchedules: [schedule],
};

function success(
  transcript: string,
  context: VoiceInterpretationContext,
  command: 'SELECT_TOUR_PRODUCT' | 'SELECT_SCHEDULE',
  id: number,
): void {
  const result = interpretVoiceTranscriptWithContext(transcript, context);
  expect(result).toEqual({
    ok: true,
    normalizedTranscript: normalizeVoiceTranscript(transcript),
    command: {
      version: 1,
      command,
      args: command === 'SELECT_TOUR_PRODUCT' ? { tourProductId: id } : { scheduleId: id },
    },
  });
  if (result.ok) expect(decodeVoiceCommand(result.command).ok).toBe(true);
}

function failure(
  transcript: string,
  context: VoiceInterpretationContext,
  code: 'UNRECOGNIZED' | 'AMBIGUOUS' | 'UNSUPPORTED_INTENT',
): void {
  const result = interpretVoiceTranscriptWithContext(transcript, context);
  expect(result).toMatchObject({ ok: false, error: { code } });
  expect(result).not.toHaveProperty('command');
}

describe('V2 regression through the context API', () => {
  it.each(VOICE_PHRASES)(
    'preserves $transcript with empty and populated context',
    ({ transcript }) => {
      for (const context of [empty, productContext, scheduleContext]) {
        expect(interpretVoiceTranscriptWithContext(transcript, context)).toEqual(
          interpretVoiceTranscript(transcript),
        );
      }
    },
  );

  it.each([
    '',
    '!?',
    'unknown',
    '골프 테마 선택',
    '인원 3명',
    '인원 두 명으로 설정',
    '상품 201 선택',
    '일정 501 선택',
    '상품 0 선택',
    '일정 -1 선택',
    'select product 1.5',
    '인원 11명',
    '예약 제출',
    'select schedule 2026-11-10',
  ])('preserves empty-context result for %s', (transcript) => {
    expect(interpretVoiceTranscriptWithContext(transcript, empty)).toEqual(
      interpretVoiceTranscript(transcript),
    );
  });

  it.each(UNSUPPORTED_PHRASES)('retains unsupported intent guard for %s even as a name', (name) => {
    failure(
      `상품 ${name} 선택`,
      { ...empty, tourProducts: [{ id: 201, name }] },
      'UNSUPPORTED_INTENT',
    );
  });

  it('keeps exactly eleven canonical commands', () => {
    expect(VOICE_COMMAND_NAMES).toHaveLength(11);
  });
});

describe('current product exact matching', () => {
  it.each([
    '제주 골프 여행 상품 선택',
    '제주 골프 여행 투어 선택',
    '상품 제주 골프 여행 선택',
    '투어 제주 골프 여행 선택',
    'select product 제주 골프 여행',
  ])('resolves controlled template %s', (transcript) => {
    success(transcript, productContext, 'SELECT_TOUR_PRODUCT', 201);
  });

  it.each([
    ['제주   골프 여행', ' 상품  제주 골프   여행 선택 '],
    ['제주,골프! 여행', '제주 골프 여행 상품 선택'],
    ['JEJU Golf Trip', 'select product jeju golf trip'],
    ['ＪＥＪＵ　Ｇｏｌｆ　Ｔｒｉｐ', 'JEJU GOLF TRIP 투어 선택'],
    ['제주 🏝️ 골프', '상품 제주 🏝️ 골프 선택'],
    ['[.*] 제주 (골프)', '상품 [.*] 제주 (골프) 선택'],
  ])('uses transcript normalization for name %s', (name, transcript) => {
    success(
      transcript,
      { ...empty, tourProducts: [{ id: 201, name }] },
      'SELECT_TOUR_PRODUCT',
      201,
    );
  });

  it.each([
    '제주 골프 여행',
    '상품 제주 골프 선택',
    '상품 골프 여행 선택',
    '상품 제주 골푸 여행 선택',
    '상품 제주 골프 여행 추천',
    '상품 제주 골프 여행 선택 그리고 일정 501 선택',
  ])('does not infer bare, partial, fuzzy, or multiple actions: %s', (transcript) => {
    expect(interpretVoiceTranscriptWithContext(transcript, productContext).ok).toBe(false);
  });

  it('uses only the supplied current choices on each call', () => {
    failure('상품 제주 골프 여행 선택', empty, 'UNRECOGNIZED');
    success('상품 제주 골프 여행 선택', productContext, 'SELECT_TOUR_PRODUCT', 201);
    failure('상품 제주 골프 여행 선택', empty, 'UNRECOGNIZED');
  });

  it.each([
    [
      { id: 201, name: '제주 골프' },
      { id: 202, name: '제주 골프' },
    ],
    [
      { id: 201, name: 'JEJU,Golf' },
      { id: 202, name: 'jeju   golf' },
    ],
  ])('reports different IDs sharing a normalized name', (...tourProducts) => {
    failure(`상품 ${tourProducts[0].name} 선택`, { ...empty, tourProducts }, 'AMBIGUOUS');
    failure(
      `상품 ${tourProducts[0].name} 선택`,
      { ...empty, tourProducts: [...tourProducts].reverse() },
      'AMBIGUOUS',
    );
  });

  it('deduplicates identical entries and static/dynamic canonical IDs', () => {
    success(
      '상품 제주 골프 여행 선택',
      { ...empty, tourProducts: [...productContext.tourProducts, ...productContext.tourProducts] },
      'SELECT_TOUR_PRODUCT',
      201,
    );
    success(
      '상품 201 선택',
      { ...empty, tourProducts: [{ id: 201, name: '201' }] },
      'SELECT_TOUR_PRODUCT',
      201,
    );
  });

  it('combines different static and dynamic IDs without priority', () => {
    failure('상품 201 선택', { ...empty, tourProducts: [{ id: 202, name: '201' }] }, 'AMBIGUOUS');
    success('상품 201 선택', productContext, 'SELECT_TOUR_PRODUCT', 201);
    success('일정 501 선택', scheduleContext, 'SELECT_SCHEDULE', 501);
  });
});

describe('calendar date and range matching', () => {
  it.each([
    '2026-11-10 일정 선택',
    '2026-11-10 스케줄 선택',
    '일정 2026-11-10 선택',
    '스케줄 2026-11-10 선택',
    'select schedule 2026-11-10',
    '2026년 11월 10일 일정 선택',
    '11월 10일 일정 선택',
    '스케줄 11월 10일 선택',
    '2026-11-10부터 2026-11-14까지 일정 선택',
    '2026년 11월 10일부터 2026년 11월 14일까지 일정 선택',
    '11월 10일부터 11월 14일까지 일정 선택',
    'from 2026-11-10 to 2026-11-14 schedule',
    '일정 11월 10일부터 11월 14일까지 선택',
    '11월 10일부터 11월 14일까지 스케줄 선택',
  ])('resolves supplied dates: %s', (transcript) => {
    success(transcript, scheduleContext, 'SELECT_SCHEDULE', 501);
  });

  it.each(['11월 10일', '11월 14일 일정 선택', '11월 11일 일정 선택', '2026-11 일정 선택'])(
    'requires a complete start-date action: %s',
    (transcript) => {
      failure(transcript, scheduleContext, 'UNRECOGNIZED');
    },
  );

  it('short dates collide across years; full-year dates disambiguate', () => {
    const context = {
      ...empty,
      tourSchedules: [
        schedule,
        { ...schedule, id: 502, startDate: '2027-11-10', endDate: '2027-11-14' },
      ],
    };
    failure('11월 10일 일정 선택', context, 'AMBIGUOUS');
    success('일정 2026-11-10 선택', context, 'SELECT_SCHEDULE', 501);
    success('2027년 11월 10일 일정 선택', context, 'SELECT_SCHEDULE', 502);
    failure('11월 10일부터 11월 14일까지 일정 선택', context, 'AMBIGUOUS');
  });

  it('scopes only dynamic schedules to the explicit selected product', () => {
    const context = {
      ...empty,
      tourSchedules: [schedule, { ...schedule, id: 601, tourProductId: 202 }],
    };
    failure('11월 10일 일정 선택', context, 'AMBIGUOUS');
    success(
      '11월 10일 일정 선택',
      { ...context, selectedTourProductId: 201 },
      'SELECT_SCHEDULE',
      501,
    );
    success(
      '11월 10일 일정 선택',
      { ...context, selectedTourProductId: 202 },
      'SELECT_SCHEDULE',
      601,
    );
    failure('11월 10일 일정 선택', { ...context, selectedTourProductId: 999 }, 'UNRECOGNIZED');
    success('일정 601 선택', { ...context, selectedTourProductId: 201 }, 'SELECT_SCHEDULE', 601);
    success(
      '상품 제주 골프 여행 선택',
      { ...productContext, selectedTourProductId: 999 },
      'SELECT_TOUR_PRODUCT',
      201,
    );
  });

  it('does not pick one of distinct schedules on the same product', () => {
    const context = {
      ...empty,
      selectedTourProductId: 201,
      tourSchedules: [schedule, { ...schedule, id: 502, endDate: '2026-11-15' }],
    };
    failure('2026-11-10 일정 선택', context, 'AMBIGUOUS');
    success('2026-11-10부터 2026-11-14까지 일정 선택', context, 'SELECT_SCHEDULE', 501);
    success('11월 10일부터 11월 15일까지 일정 선택', context, 'SELECT_SCHEDULE', 502);
  });

  it('deduplicates repeated schedules', () => {
    success(
      '11월 10일 일정 선택',
      { ...empty, tourSchedules: [schedule, { ...schedule }] },
      'SELECT_SCHEDULE',
      501,
    );
  });

  it.each([
    '2026-13-01',
    '2026-02-30',
    '26-11-10',
    '2026-2-10',
    '2026-00-10',
    '2026-11-00',
    '0000-11-10',
    '1900-02-29',
    '2026-11-10T00:00:00Z',
  ])('skips malformed calendar date %s without repair', (date) => {
    for (const dates of [{ startDate: date }, { endDate: date }]) {
      const context = { ...empty, tourSchedules: [{ ...schedule, ...dates }] };
      for (const transcript of [
        '11월 10일 일정 선택',
        `${date} 일정 선택`,
        '11월 10일부터 11월 14일까지 일정 선택',
      ]) {
        expect(interpretVoiceTranscriptWithContext(transcript, context).ok).toBe(false);
      }
    }
  });

  it.each(['2000-02-29', '2028-02-29', '2026-01-31', '2026-04-30'])(
    'accepts valid leap/month boundary %s',
    (date) => {
      success(
        `${date} 일정 선택`,
        { ...empty, tourSchedules: [{ ...schedule, startDate: date, endDate: date }] },
        'SELECT_SCHEDULE',
        501,
      );
    },
  );

  it('skips inverted date ranges', () => {
    failure(
      '11월 10일 일정 선택',
      { ...empty, tourSchedules: [{ ...schedule, endDate: '2026-11-09' }] },
      'UNRECOGNIZED',
    );
  });
});

describe('context trust boundary and purity', () => {
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, '201'])(
    'never coerces invalid ID %s',
    (invalidId) => {
      const id = invalidId as number;
      failure(
        '상품 제주 골프 여행 선택',
        { ...empty, tourProducts: [{ id, name: '제주 골프 여행' }] },
        'UNRECOGNIZED',
      );
      failure(
        '11월 10일 일정 선택',
        { ...empty, tourSchedules: [{ ...schedule, id }] },
        'UNRECOGNIZED',
      );
      failure(
        '11월 10일 일정 선택',
        { ...empty, tourSchedules: [{ ...schedule, tourProductId: id }] },
        'UNRECOGNIZED',
      );
      failure(
        '11월 10일 일정 선택',
        { ...scheduleContext, selectedTourProductId: id },
        'UNRECOGNIZED',
      );
    },
  );

  it('skips invalid entries without hiding a valid distinct entry', () => {
    success(
      '상품 제주 골프 여행 선택',
      {
        ...empty,
        tourProducts: [{ id: 0, name: '제주 골프 여행' }, ...productContext.tourProducts],
      },
      'SELECT_TOUR_PRODUCT',
      201,
    );
    success(
      '11월 10일 일정 선택',
      { ...empty, tourSchedules: [{ ...schedule, id: 0 }, schedule] },
      'SELECT_SCHEDULE',
      501,
    );
  });

  it.each(['', '   ', '!?'])('ignores empty normalized name %s', (name) => {
    failure('상품 선택', { ...empty, tourProducts: [{ id: 201, name }] }, 'UNRECOGNIZED');
  });

  it('does not mutate frozen context or retain hidden selections', () => {
    const context = Object.freeze({
      tourProducts: Object.freeze([Object.freeze({ id: 201, name: '제주 골프 여행' })]),
      tourSchedules: Object.freeze([Object.freeze({ ...schedule })]),
      selectedTourProductId: 201,
    });
    const before = JSON.stringify(context);
    success('상품 제주 골프 여행 선택', context, 'SELECT_TOUR_PRODUCT', 201);
    success('11월 10일 일정 선택', context, 'SELECT_SCHEDULE', 501);
    expect(JSON.stringify(context)).toBe(before);
    failure('11월 10일 일정 선택', empty, 'UNRECOGNIZED');
  });
});

describe('V9.1 preserves exact dynamic names', () => {
  it('does not collapse Korean whitespace or rewrite hotel words in Product names', () => {
    const context = {
      ...empty,
      tourProducts: [
        { id: 201, name: '투어 보여줘' },
        { id: 202, name: '투어 보여 줘' },
        { id: 203, name: '삼성급 여행' },
      ],
    };
    success('상품 투어 보여줘 선택', context, 'SELECT_TOUR_PRODUCT', 201);
    success('상품 투어 보여 줘 선택', context, 'SELECT_TOUR_PRODUCT', 202);
    success('상품 삼성급 여행 선택', context, 'SELECT_TOUR_PRODUCT', 203);
    failure('상품 3성급 여행 선택', context, 'UNRECOGNIZED');
    failure('상품 투어보여줘 선택', context, 'UNRECOGNIZED');
  });
});
