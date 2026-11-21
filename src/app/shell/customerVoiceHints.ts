import type { ReservationDraftV1 } from '@/features/reservation';
import {
  createLiveVoiceContext,
  type LiveVoiceChoices,
} from '@/features/voice-bridge/liveVoiceContext';
import {
  interpretVoiceTranscriptWithContext,
  type VoiceCommand,
  type VoiceExtraOption,
  type VoiceHotelOption,
  type VoiceMealOption,
  type VoiceTheme,
  type VoiceTourStyle,
  type VoiceTransportOption,
} from '@/integrations/voice';
import { parseResourceIdRouteParam } from '@/shared/lib/resourceIdentity';

export interface VoiceCommandHint {
  /** Exactly what the customer can say. Never contains internal Product/Schedule IDs. */
  phrase: string;
  description: string;
}

type LiveContext = ReturnType<typeof createLiveVoiceContext>;

interface HintCandidate {
  /** Alternative spoken forms; the first one the current context accepts is shown. */
  phrases: readonly string[];
  description: string;
  expected: VoiceCommand;
  /** Same current-screen capability the Voice bridge checks before changing the Draft. */
  allowed: (context: LiveContext['draft']) => boolean;
}

// Spoken labels only. Each phrase is re-validated by the existing Voice interpreter below,
// so this table cannot widen what Voice accepts.
const THEME_WORDS: Record<VoiceTheme, string> = {
  HONEYMOON_ROMANCE: '허니문',
  PARENTS_HEALING: '부모님 힐링',
  GOLF_CHALLENGE: '골프',
  OUTDOOR_TREKKING: '트레킹',
};
const STYLE_WORDS: Record<VoiceTourStyle, string> = {
  CLASSIC: '클래식',
  GRAND: '그랜드',
  PREMIUM: '프리미엄',
};
const HOTEL_WORDS: Record<VoiceHotelOption, string> = {
  HOTEL_3_STAR: '3성급',
  HOTEL_4_STAR: '4성급',
  HOTEL_5_STAR: '5성급',
};
const TRANSPORT_WORDS: Record<VoiceTransportOption, string> = {
  PRIVATE_LUXURY_CAR_2: '2인 고급차량',
  PREMIUM_VAN_10: '프리미엄 밴',
};
const MEAL_WORDS: Record<VoiceMealOption, string> = {
  LUNCH_BOX: '도시락',
  LOCAL_RESTAURANT: '현지식 레스토랑',
  PREMIUM_RESTAURANT: '고급 레스토랑',
};
const EXTRA_WORDS: Record<VoiceExtraOption, string> = {
  CHAMPAGNE: '샴페인',
  COFFEE: '커피',
};

const STYLE_PREFERENCE: readonly VoiceTourStyle[] = ['PREMIUM', 'GRAND', 'CLASSIC'];

/**
 * Builds short, speakable examples for the current customer screen.
 *
 * Only values already on screen are used (loaded products, the product's selectable
 * schedules, the configure catalog). Every example is run through the same interpreter
 * and capability context as live Voice, so an example is shown only if saying it now
 * would be understood and accepted. No HTTP, storage or Draft mutation happens here.
 */
export function createVoiceCommandHints(
  choices: LiveVoiceChoices,
  draft: ReservationDraftV1,
): VoiceCommandHint[] {
  const context = createLiveVoiceContext(choices, draft);
  const removalContext = createLiveVoiceContext(choices, draft, true);
  const candidates =
    choices.screen === 'discovery'
      ? discoveryCandidates(choices)
      : choices.screen === 'detail'
        ? detailCandidates(choices, draft)
        : configureCandidates(draft);

  const hints: VoiceCommandHint[] = [];
  const shown = new Set<string>();
  for (const candidate of candidates) {
    // One example per kind of choice keeps the guidance short; later candidates are fallbacks.
    const kind =
      candidate.expected.command === 'REMOVE_OPTION' ? 'ADD_OPTION' : candidate.expected.command;
    if (shown.has(kind)) continue;
    const capabilityContext =
      candidate.expected.command === 'REMOVE_OPTION' ? removalContext : context;
    if (!candidate.allowed(capabilityContext.draft)) continue;
    const phrase = candidate.phrases.find((spoken) => {
      const result = interpretVoiceTranscriptWithContext(spoken, context.interpretation);
      return result.ok && sameCommand(result.command, candidate.expected);
    });
    if (phrase === undefined) continue;
    shown.add(kind);
    hints.push({ phrase, description: candidate.description });
  }
  return hints;
}

function discoveryCandidates(choices: LiveVoiceChoices): HintCandidate[] {
  const product = choices.products[0];
  if (!product) return [];
  const id = parseResourceIdRouteParam(product.id);
  const candidates: HintCandidate[] = [
    {
      phrases: [`${THEME_WORDS[product.theme]} 상품 보여줘`],
      description: 'Filter tours by theme',
      expected: { version: 1, command: 'SHOW_TOURS', args: { theme: product.theme } },
      allowed: () => true,
    },
  ];
  if (id !== null) candidates.push(productCandidate(product.name, id, 'Open this tour'));
  return candidates;
}

function detailCandidates(choices: LiveVoiceChoices, draft: ReservationDraftV1): HintCandidate[] {
  const { product } = choices;
  const id = parseResourceIdRouteParam(product?.id);
  if (!product || id === null) return [];
  // Style and schedule commands need this product's Draft first, exactly like the GUI.
  if (draft.tourProductId !== product.id) {
    return [productCandidate(product.name, id, 'Start planning this tour')];
  }

  const candidates: HintCandidate[] = [];
  const style = STYLE_PREFERENCE.find(
    (candidate) => candidate !== draft.tourStyle && product.availableStyles.includes(candidate),
  );
  if (style) {
    candidates.push({
      phrases: [`${STYLE_WORDS[style]} 등급 선택`],
      description: 'Choose a style',
      expected: { version: 1, command: 'SELECT_STYLE', args: { style } },
      allowed: (context) => context.canSelectStyle(style),
    });
  }

  const schedule = choices.schedules.find(
    (candidate) =>
      candidate.isSelectable &&
      candidate.calendar !== undefined &&
      candidate.selectionKey !== draft.tourScheduleId,
  );
  const scheduleId = parseResourceIdRouteParam(schedule?.selectionKey);
  if (schedule?.calendar && scheduleId !== null) {
    const [year, month, day] = schedule.calendar.startDate.split('-').map(Number);
    candidates.push({
      // The short form is shown unless another schedule shares the same month/day.
      phrases: [`${month}월 ${day}일 일정 선택`, `${year}년 ${month}월 ${day}일 일정 선택`],
      description: 'Choose a departure date',
      expected: { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId } },
      allowed: (context) => context.canSelectSchedule(scheduleId),
    });
  }
  return candidates;
}

function configureCandidates(draft: ReservationDraftV1): HintCandidate[] {
  const { configuration } = draft;
  const candidates: HintCandidate[] = [];

  const current = draft.participantCount ?? 0;
  const counts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .filter((count) => count !== current)
    .sort((a, b) => rankCount(a, current) - rankCount(b, current));
  for (const participantCount of counts) {
    candidates.push({
      phrases: [`인원 ${participantCount}명`],
      description: 'Change participants',
      expected: { version: 1, command: 'SET_PARTICIPANT_COUNT', args: { participantCount } },
      allowed: (context) =>
        context.canSetParticipantCount(participantCount) &&
        context.validateCandidateTransportCapacity({
          participantCount,
          transportSelectionKey: configuration.transportSelectionKey,
        }) !== 'exceeded',
    });
  }

  for (const hotelOption of reversedKeys(HOTEL_WORDS)) {
    if (configuration.hotelSelectionKey === hotelOption) continue;
    candidates.push({
      phrases: [`호텔 ${HOTEL_WORDS[hotelOption]} 선택`],
      description: 'Change hotel',
      expected: { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption } },
      allowed: (context) => context.resolveHotelSelectionKey(hotelOption) !== null,
    });
  }

  for (const transportOption of reversedKeys(TRANSPORT_WORDS)) {
    if (configuration.transportSelectionKey === transportOption) continue;
    candidates.push({
      phrases: [`차량 ${TRANSPORT_WORDS[transportOption]} 선택`],
      description: 'Change transport',
      expected: { version: 1, command: 'CHANGE_TRANSPORT', args: { transportOption } },
      allowed: (context) =>
        context.resolveTransportSelectionKey(transportOption) !== null &&
        context.validateCandidateTransportCapacity({
          participantCount: draft.participantCount,
          transportSelectionKey: transportOption,
        }) !== 'exceeded',
    });
  }

  for (const mealOption of reversedKeys(MEAL_WORDS)) {
    if (configuration.mealSelectionKey === mealOption) continue;
    candidates.push({
      phrases: [`식사 ${MEAL_WORDS[mealOption]} 선택`],
      description: 'Change meal',
      expected: { version: 1, command: 'CHANGE_MEAL', args: { mealOption } },
      allowed: (context) => context.resolveMealSelectionKey(mealOption) !== null,
    });
  }

  for (const extraOption of Object.keys(EXTRA_WORDS) as VoiceExtraOption[]) {
    const selected = configuration.extraSelectionKeys.includes(extraOption);
    candidates.push(
      selected
        ? {
            phrases: [`${EXTRA_WORDS[extraOption]} 빼줘`],
            description: 'Remove an extra',
            expected: { version: 1, command: 'REMOVE_OPTION', args: { extraOption } },
            allowed: (context) => context.resolveExtraSelectionKey(extraOption) !== null,
          }
        : {
            phrases: [`${EXTRA_WORDS[extraOption]} 추가`],
            description: 'Add an extra',
            expected: { version: 1, command: 'ADD_OPTION', args: { extraOption } },
            allowed: (context) => context.resolveExtraSelectionKey(extraOption) !== null,
          },
    );
  }

  return candidates;
}

function productCandidate(name: string, tourProductId: number, description: string) {
  return {
    phrases: [`${name} 상품 선택`],
    description,
    expected: { version: 1, command: 'SELECT_TOUR_PRODUCT', args: { tourProductId } },
    allowed: (context: LiveContext['draft']) => context.canSelectTourProduct(tourProductId),
  } satisfies HintCandidate;
}

/** Prefer one more participant, then nearby counts, so examples stay realistic. */
function rankCount(count: number, current: number): number {
  return count > current ? (count - current) * 2 - 1 : (current - count) * 2;
}

function reversedKeys<K extends string>(record: Record<K, string>): K[] {
  return (Object.keys(record) as K[]).reverse();
}

function sameCommand(actual: VoiceCommand, expected: VoiceCommand): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}
