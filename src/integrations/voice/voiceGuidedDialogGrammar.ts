import {
  type VoiceExtraOption,
  type VoiceTheme,
  type VoiceTourStyle,
  VOICE_EXTRA_OPTIONS,
} from './voiceCommand';
import { interpretVoiceTranscriptWithContext } from './voiceCommandInterpreter';
import { type VoiceInterpretationContext } from './voiceInterpretationContext';
import { EXTRA_ALIASES, STYLE_ALIASES, THEME_ALIASES } from './voiceLexicon';
import { normalizeVoiceTranscript } from './voiceTranscriptNormalizer';

/**
 * Conversational utterances understood by the guided dialog layer, in front of the exact grammar.
 * Pure data: matching never executes a command, reads app state, or submits a reservation.
 */
export type GuidedVoiceUtterance =
  | { kind: 'RECOMMEND' }
  | { kind: 'CELEBRATION' }
  | { kind: 'CHOOSE_THEME'; theme: VoiceTheme }
  | { kind: 'CHOOSE_STYLE'; style: VoiceTourStyle }
  | { kind: 'ADD_EXTRAS'; extras: readonly VoiceExtraOption[] }
  | { kind: 'CONFIRM' }
  | { kind: 'DECLINE' };

// Dialog-only theme words. They are accepted only inside the "<theme> 좋겠어요" sentence shape,
// so short words such as 낭만 never widen the exact command grammar.
const DIALOG_THEME_ALIASES: Record<VoiceTheme, readonly string[]> = {
  HONEYMOON_ROMANCE: [...THEME_ALIASES.HONEYMOON_ROMANCE, '낭만', '허니문 로맨스', '신혼'],
  PARENTS_HEALING: [...THEME_ALIASES.PARENTS_HEALING, '힐링'],
  GOLF_CHALLENGE: [...THEME_ALIASES.GOLF_CHALLENGE],
  OUTDOOR_TREKKING: [...THEME_ALIASES.OUTDOOR_TREKKING, '아웃도어'],
};

const AGREEMENT_ENDINGS = [
  '좋겠어요',
  '좋겠네요',
  '좋겠습니다',
  '좋아요',
  '좋네요',
  '좋습니다',
  '좋을 것 같아요',
  '좋은 것 같아요',
  '할게요',
  '할래요',
  '하겠습니다',
  '괜찮아요',
  '마음에 들어요',
];
const LEADS = ['네', '예', '그럼', '그러면', '음', '저는', '그래요'];
const EXTRA_ENDINGS = [
  '해요',
  '해 주세요',
  '해주세요',
  '해 줘요',
  '해줘요',
  '해 줘',
  '해줘',
  '할게요',
  '할래요',
  '하고 싶어요',
  '하겠습니다',
  '합니다',
  '부탁해요',
  '부탁드려요',
];
const QUANTITY = String.raw`(?:\d+|한|하나|두|둘|세|셋|네|넷)`;
const UNIT = '(?:포트|병|잔|개|팟|주전자|bottle|bottles|pot|pots|cup|cups)';
const CELEBRATION_WORDS = [
  '결혼',
  '신혼',
  '허니문',
  '기념일',
  '웨딩',
  '약혼',
  'anniversary',
  'wedding',
];
const RECOMMEND_WORDS = ['추천', 'recommend'];

const CONFIRM = new RegExp(
  `^(?:(?:네|예|응) )?(?:맞아요|맞습니다|맞네요|맞아|그래요|좋아요 맞아요|correct|yes)$`,
);
const DECLINE = new RegExp(
  `^(?:(?:아니요|아니오|아뇨|아니) ?)?(?:없어요|없습니다|없네요|없어|괜찮아요|됐어요)$|^(?:아니요|아니오|아뇨)$|^no(?: thanks)?$`,
);

const THEME_PATTERN = sentencePattern(DIALOG_THEME_ALIASES, '(?: ?(?:투어|여행|상품|여행 상품))?');
const STYLE_PATTERN = sentencePattern(STYLE_ALIASES, '(?: ?(?:스타일|등급))?', true);
const EXTRAS_PATTERN = extrasPattern();

/**
 * Matches one guided-dialog utterance, or returns null so the existing exact grammar runs.
 *
 * The sentence shapes deliberately avoid the exact grammar endings (보여줘/선택/변경/추가/제거),
 * so an existing command keeps its existing meaning. Celebration words are only recognised
 * when the exact grammar did not understand the sentence (e.g. "허니문 상품 보여줘" stays SHOW_TOURS).
 */
export function matchGuidedVoiceUtterance(
  transcript: string,
  context: VoiceInterpretationContext,
): GuidedVoiceUtterance | null {
  const text = normalizeVoiceTranscript(transcript);
  if (!text) return null;
  if (RECOMMEND_WORDS.some((word) => text.includes(word))) return { kind: 'RECOMMEND' };

  const extras = matchExtras(text);
  if (extras) return { kind: 'ADD_EXTRAS', extras };

  const theme = matchSentence(text, THEME_PATTERN);
  if (theme) return { kind: 'CHOOSE_THEME', theme };

  const style = matchSentence(text, STYLE_PATTERN);
  if (style) return { kind: 'CHOOSE_STYLE', style };

  if (CONFIRM.test(text)) return { kind: 'CONFIRM' };
  if (DECLINE.test(text)) return { kind: 'DECLINE' };

  if (CELEBRATION_WORDS.some((word) => text.includes(word))) {
    const existing = interpretVoiceTranscriptWithContext(text, context);
    if (!existing.ok && existing.error.code === 'UNRECOGNIZED') return { kind: 'CELEBRATION' };
  }
  return null;
}

interface SentencePattern<Value extends string> {
  regex: RegExp;
  values: ReadonlyMap<string, Value>;
}

function sentencePattern<Value extends string>(
  aliases: Readonly<Record<Value, readonly string[]>>,
  suffix: string,
  allowLeadSelect = false,
): SentencePattern<Value> {
  const values = new Map<string, Value>();
  for (const value of Object.keys(aliases) as Value[]) {
    for (const alias of aliases[value]) values.set(alias, value);
  }
  const alternatives = alternation([...values.keys()]);
  const endings = alternation(AGREEMENT_ENDINGS);
  // "<style> 선택" alone is the exact grammar; the dialog accepts it only after a lead ("네, ...").
  const select = allowLeadSelect ? '|(?<select>선택(?:할게요|해요|해 주세요|해주세요)?)' : '';
  const regex = new RegExp(
    `^(?:(?<lead>${alternation(LEADS)}) )?(?<value>${alternatives})${suffix}` +
      `(?:이|가|로|으로|은|는)? (?:${endings}${select})$`,
  );
  return { regex, values };
}

function matchSentence<Value extends string>(
  text: string,
  { regex, values }: SentencePattern<Value>,
): Value | null {
  const match = regex.exec(text);
  const groups = match?.groups;
  if (!groups?.value) return null;
  if (groups.select !== undefined && groups.lead === undefined) return null;
  return values.get(groups.value) ?? null;
}

function extrasPattern(): RegExp {
  const words = alternation(VOICE_EXTRA_OPTIONS.flatMap((option) => EXTRA_ALIASES[option]));
  const item = `(?:${words})(?: ?${QUANTITY} ?${UNIT})?(?:을|를|도)?`;
  const separator = '(?: ?(?:이랑|랑|하고|와|과|및|그리고|and) ?| )';
  const meal = '(?:식사 ?(?:시|때|할 때|하실 때)에? |식사에 |식사와 함께 |식사랑 )';
  return new RegExp(
    `^(?:그리고 |또 |그럼 )?${meal}?(?<items>${item}(?:${separator}${item})*) ?추가 ?(?:${alternation(EXTRA_ENDINGS)})$`,
  );
}

function matchExtras(text: string): VoiceExtraOption[] | null {
  const items = EXTRAS_PATTERN.exec(text)?.groups?.items;
  if (!items) return null;
  const extras: VoiceExtraOption[] = [];
  const mentions: { index: number; option: VoiceExtraOption }[] = [];
  for (const option of VOICE_EXTRA_OPTIONS) {
    for (const alias of EXTRA_ALIASES[option]) {
      let index = items.indexOf(alias);
      while (index !== -1) {
        mentions.push({ index, option });
        index = items.indexOf(alias, index + alias.length);
      }
    }
  }
  mentions.sort((a, b) => a.index - b.index);
  for (const { option } of mentions) if (!extras.includes(option)) extras.push(option);
  return extras.length > 0 ? extras : null;
}

/** Longest alternatives first so "허니문 낭만" wins over "허니문". */
function alternation(words: readonly string[]): string {
  return [...new Set(words)]
    .sort((a, b) => b.length - a.length)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
}
