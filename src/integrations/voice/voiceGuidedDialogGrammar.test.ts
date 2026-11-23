// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { interpretVoiceTranscript, VOICE_PHRASES } from './voiceCommandInterpreter';
import { matchGuidedVoiceUtterance } from './voiceGuidedDialogGrammar';
import { type VoiceInterpretationContext } from './voiceInterpretationContext';

const context: VoiceInterpretationContext = {
  tourProducts: [{ id: 201, name: '허니문 낭만 투어' }],
  tourSchedules: [{ id: 501, tourProductId: 201, startDate: '2026-12-24', endDate: '2026-12-28' }],
};
const match = (text: string) => matchGuidedVoiceUtterance(text, context);

describe('presentation script lines', () => {
  it.each([
    ['멋진 여행 상품 추천해주세요.', { kind: 'RECOMMEND' }],
    ['다음달 오늘에 결혼해요', { kind: 'CELEBRATION' }],
    ['허니문 낭만 투어 좋겠어요.', { kind: 'CHOOSE_THEME', theme: 'HONEYMOON_ROMANCE' }],
    ['네, 프리미엄 스타일 좋아요.', { kind: 'CHOOSE_STYLE', style: 'PREMIUM' }],
    [
      '그리고 식사시 커피 1포트, 샴페인 1병 추가해요.',
      { kind: 'ADD_EXTRAS', extras: ['COFFEE', 'CHAMPAGNE'] },
    ],
    ['맞아요.', { kind: 'CONFIRM' }],
    ['없어요.', { kind: 'DECLINE' }],
  ])('%s', (line, expected) => {
    expect(match(line)).toEqual(expected);
  });

  it('keeps the plain interpreter rule: 추천 alone is still UNSUPPORTED there', () => {
    const result = interpretVoiceTranscript('멋진 여행 상품 추천해주세요');
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.code).toBe('UNSUPPORTED_INTENT');
  });
});

describe('natural variants', () => {
  it.each([
    ['추천해 주세요', 'RECOMMEND'],
    ['여행 추천 좀 해줄래요', 'RECOMMEND'],
    ['결혼기념일이에요', 'CELEBRATION'],
    ['신혼여행 가려고요', 'CELEBRATION'],
    ['다음 달에 웨딩이 있어요', 'CELEBRATION'],
    ['네 맞아요', 'CONFIRM'],
    ['맞습니다', 'CONFIRM'],
    ['아니요 없어요', 'DECLINE'],
    ['아니요, 없습니다', 'DECLINE'],
  ])('%s → %s', (line, kind) => {
    expect(match(line)?.kind).toBe(kind);
  });

  it.each([
    ['허니문 낭만 투어 좋아요', 'HONEYMOON_ROMANCE'],
    ['허니문 낭만 투어로 할게요', 'HONEYMOON_ROMANCE'],
    ['낭만 투어 좋겠어요', 'HONEYMOON_ROMANCE'],
    ['허니문낭만 여행 좋겠어요', 'HONEYMOON_ROMANCE'],
    ['그럼 허니문 투어 좋아요', 'HONEYMOON_ROMANCE'],
    ['아웃도어 트레킹 투어 좋겠어요', 'OUTDOOR_TREKKING'],
    ['아웃도어 트레킹 할게요', 'OUTDOOR_TREKKING'],
    ['골프 챌린지 투어 좋아요', 'GOLF_CHALLENGE'],
  ])('theme: %s', (line, theme) => {
    expect(match(line)).toEqual({ kind: 'CHOOSE_THEME', theme });
  });

  it.each([
    ['프리미엄 스타일 좋아요', 'PREMIUM'],
    ['프리미엄 좋겠어요', 'PREMIUM'],
    ['네 그랜드 등급으로 할게요', 'GRAND'],
    ['네, 프리미엄 스타일 선택', 'PREMIUM'],
    ['클래식 스타일로 할게요', 'CLASSIC'],
  ])('style: %s', (line, style) => {
    expect(match(line)).toEqual({ kind: 'CHOOSE_STYLE', style });
  });

  it.each([
    ['커피 추가해요', ['COFFEE']],
    ['샴페인 추가해요', ['CHAMPAGNE']],
    ['커피랑 샴페인 추가해요', ['COFFEE', 'CHAMPAGNE']],
    ['샴페인 한 병이랑 커피 추가해 주세요', ['CHAMPAGNE', 'COFFEE']],
    ['식사 때 커피 1 포트 추가할게요', ['COFFEE']],
    ['그리고 식사시 커피 1포트 샴페인 1병 추가해요', ['COFFEE', 'CHAMPAGNE']],
    ['커피와 샴페인 1병 추가해주세요', ['COFFEE', 'CHAMPAGNE']],
  ])('extras: %s', (line, extras) => {
    expect(match(line)).toEqual({ kind: 'ADD_EXTRAS', extras });
  });
});

describe('the existing exact grammar keeps its meaning', () => {
  it('never claims any phrase the exact interpreter already understands', () => {
    const claimed = VOICE_PHRASES.filter((phrase) => match(phrase.transcript) !== null);
    expect(claimed.map((phrase) => phrase.transcript)).toEqual([]);
  });

  it.each([
    '허니문 상품 보여줘',
    '허니문 낭만 상품 보여줘',
    '신혼여행 테마 선택',
    '프리미엄 스타일 선택',
    '커피 추가',
    '샴페인 빼줘',
    '12월 24일 일정 선택',
    '상품 허니문 낭만 투어 선택',
  ])('%s passes through to the interpreter', (line) => {
    expect(match(line)).toBeNull();
  });

  it.each(['', '안녕하세요', '예약해줘', '결혼 예약 제출', '커피 1포트 주세요'])(
    'unrelated or unsupported speech is not a dialog line: %s',
    (line) => {
      expect(match(line)).toBeNull();
    },
  );
});
