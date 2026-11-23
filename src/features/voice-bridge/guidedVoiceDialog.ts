import type { ReservationDraftV1 } from '@/features/reservation';
import type {
  GuidedVoiceUtterance,
  VoiceCommand,
  VoiceExtraOption,
  VoiceTheme,
  VoiceTourStyle,
} from '@/integrations/voice';
import { parseResourceIdRouteParam } from '@/shared/lib/resourceIdentity';
import type { LiveVoiceChoices } from './liveVoiceContext';
import type { VoiceBridgeResult } from './voiceCommandBridge';

/**
 * Guided spoken dialog in front of the exact Voice grammar.
 *
 * Scripted keyword replies only. Every Draft change still goes through the existing
 * VoiceCommand bridge and its current-screen capability checks, one command at a time.
 * The dialog never submits a reservation: the closing line asks the customer to use the GUI.
 */
export interface GuidedVoiceDialogState {
  started: boolean;
  theme: VoiceTheme | null;
  style: VoiceTourStyle | null;
  extras: readonly VoiceExtraOption[];
}

export interface GuidedVoiceDialogView {
  customerName: string | null;
  choices: LiveVoiceChoices;
  draft: ReservationDraftV1;
}

export interface GuidedVoiceDialogDeps {
  /** Read fresh after each command, because a command can change Draft and route. */
  getView: () => GuidedVoiceDialogView;
  /** The existing bridge path (capability checks, flushSync commit, navigation). */
  execute: (command: VoiceCommand) => VoiceBridgeResult;
}

export interface GuidedVoiceDialogTurn {
  state: GuidedVoiceDialogState;
  reply: string;
  /** The dialog is complete; the caller stops listening after the reply. */
  closed: boolean;
}

export const INITIAL_GUIDED_VOICE_DIALOG_STATE: GuidedVoiceDialogState = {
  started: false,
  theme: null,
  style: null,
  extras: [],
};

export const THEME_SPOKEN_NAMES: Record<VoiceTheme, string> = {
  HONEYMOON_ROMANCE: '허니문 낭만 투어',
  PARENTS_HEALING: '부모님 힐링 투어',
  GOLF_CHALLENGE: '골프 챌린지 투어',
  OUTDOOR_TREKKING: '아웃도어 트레킹 투어',
};
export const STYLE_SPOKEN_NAMES: Record<VoiceTourStyle, string> = {
  CLASSIC: '클래식 스타일',
  GRAND: '그랜드 스타일',
  PREMIUM: '프리미엄 스타일',
};
export const EXTRA_SPOKEN_NAMES: Record<VoiceExtraOption, string> = {
  COFFEE: '커피 1포트',
  CHAMPAGNE: '샴페인 1병',
};

export const GUIDED_DIALOG_LINES = {
  askOccasion: '무슨 기념일인가요?',
  celebrate: '정말 축하드려요. 허니문 낭만 투어 또는 아웃도어 트레킹 투어는 어떠세요?',
  askMore: '추가로 필요하신 것 있으세요?',
  closing: '선택하신 내용을 화면에서 확인하신 뒤 Review trip 버튼을 눌러 예약을 진행해 주세요.',
  chooseProductFirst: '먼저 화면에서 여행 상품을 선택해 주세요.',
  chooseStyleFirst: '먼저 여행 스타일을 선택해 주세요.',
  chooseScheduleFirst:
    '커피와 샴페인은 출발 일정을 고른 뒤 추가할 수 있어요. 먼저 화면에서 일정을 선택해 주세요.',
  openConfigureFirst:
    '화면의 Configure this trip 버튼을 눌러 옵션 화면으로 이동하신 뒤 다시 말씀해 주세요.',
  extraUnavailable: '죄송해요, 지금은 그 옵션을 추가할 수 없어요. 화면에서 선택해 주세요.',
  unavailable: '죄송해요, 지금은 그 선택을 할 수 없어요. 화면에서 선택해 주세요.',
} as const;

const STYLE_SUGGESTION_ORDER: readonly VoiceTourStyle[] = ['PREMIUM', 'GRAND', 'CLASSIC'];

export function startGuidedVoiceDialog(customerName: string | null): GuidedVoiceDialogTurn {
  return {
    state: { ...INITIAL_GUIDED_VOICE_DIALOG_STATE, started: true },
    reply: `안녕하세요, ${honorific(customerName)}어떤 여행 상품을 예약하시겠습니까?`,
    closed: false,
  };
}

export function runGuidedVoiceDialogTurn(
  current: GuidedVoiceDialogState,
  utterance: GuidedVoiceUtterance,
  deps: GuidedVoiceDialogDeps,
): GuidedVoiceDialogTurn {
  const state: GuidedVoiceDialogState = { ...current, started: true };
  switch (utterance.kind) {
    case 'RECOMMEND':
      return turn(state, GUIDED_DIALOG_LINES.askOccasion);
    case 'CELEBRATION':
      return turn(state, GUIDED_DIALOG_LINES.celebrate);
    case 'CHOOSE_THEME':
      return chooseTheme(state, utterance.theme, deps);
    case 'CHOOSE_STYLE':
      return chooseStyle(state, utterance.style, deps);
    case 'ADD_EXTRAS':
      return addExtras(state, utterance.extras, deps);
    case 'CONFIRM':
      return turn(state, GUIDED_DIALOG_LINES.askMore);
    case 'DECLINE':
      return {
        state: INITIAL_GUIDED_VOICE_DIALOG_STATE,
        reply: GUIDED_DIALOG_LINES.closing,
        closed: true,
      };
  }
}

function chooseTheme(
  state: GuidedVoiceDialogState,
  theme: VoiceTheme,
  { getView, execute }: GuidedVoiceDialogDeps,
): GuidedVoiceDialogTurn {
  const { choices } = getView();
  const visible =
    choices.screen === 'discovery' ? choices.products : choices.product ? [choices.product] : [];
  const matching = visible.filter((product) => product.theme === theme);
  const only = matching.length === 1 ? matching[0] : undefined;
  const id = parseResourceIdRouteParam(only?.id);
  const next = { ...state, theme, style: null, extras: [] };
  const name = THEME_SPOKEN_NAMES[theme];

  if (only && id !== null) {
    const result = execute({
      version: 1,
      command: 'SELECT_TOUR_PRODUCT',
      args: { tourProductId: id },
    });
    if (result.ok) {
      const style = STYLE_SUGGESTION_ORDER.find((candidate) =>
        only.availableStyles.includes(candidate),
      );
      return turn(
        next,
        style
          ? `${name} 알겠습니다. 그리고 스타일은 ${STYLE_SPOKEN_NAMES[style]} 어떨까요?`
          : `${name} 알겠습니다. 화면에서 스타일을 선택해 주세요.`,
      );
    }
  }

  const result = execute({ version: 1, command: 'SHOW_TOURS', args: { theme } });
  return turn(
    next,
    result.ok
      ? `${name} 알겠습니다. 화면에서 마음에 드는 상품을 골라 주세요. 스타일은 ${STYLE_SPOKEN_NAMES.PREMIUM} 어떨까요?`
      : GUIDED_DIALOG_LINES.unavailable,
  );
}

function chooseStyle(
  state: GuidedVoiceDialogState,
  style: VoiceTourStyle,
  { getView, execute }: GuidedVoiceDialogDeps,
): GuidedVoiceDialogTurn {
  const result = execute({ version: 1, command: 'SELECT_STYLE', args: { style } });
  const view = getView();
  if (!result.ok) {
    if (view.draft.tourProductId === null) {
      return turn(state, GUIDED_DIALOG_LINES.chooseProductFirst);
    }
    const product = currentProduct(view);
    if (product && !product.availableStyles.includes(style)) {
      return turn(state, `죄송해요, 이 상품은 ${STYLE_SPOKEN_NAMES[style]}를 선택할 수 없어요.`);
    }
    return turn(state, GUIDED_DIALOG_LINES.unavailable);
  }
  const next = { ...state, style, theme: currentTheme(view) ?? state.theme };
  return turn(
    next,
    `네, ${honorific(view.customerName)}${summary({ ...next, extras: [] })}로 선택하셨습니다.`,
  );
}

function addExtras(
  state: GuidedVoiceDialogState,
  extras: readonly VoiceExtraOption[],
  { getView, execute }: GuidedVoiceDialogDeps,
): GuidedVoiceDialogTurn {
  const added: VoiceExtraOption[] = [];
  let failed = false;
  for (const extraOption of extras) {
    const result = execute({ version: 1, command: 'ADD_OPTION', args: { extraOption } });
    if (result.ok) added.push(extraOption);
    else failed = true;
  }
  const view = getView();
  if (added.length === 0) return turn(state, extraGuidance(view));

  const next: GuidedVoiceDialogState = {
    ...state,
    theme: currentTheme(view) ?? state.theme,
    style: view.draft.tourStyle ?? state.style,
    extras: [...state.extras.filter((extra) => !added.includes(extra)), ...added],
  };
  const line = `네, ${honorific(view.customerName)}${summary(next)} 추가하셨습니다.`;
  return turn(next, failed ? `${line} ${GUIDED_DIALOG_LINES.extraUnavailable}` : line);
}

/** Explains the real GUI step that is still missing before extras can change. */
function extraGuidance({ draft, choices }: GuidedVoiceDialogView): string {
  if (draft.tourProductId === null) return GUIDED_DIALOG_LINES.chooseProductFirst;
  if (draft.tourStyle === null) return GUIDED_DIALOG_LINES.chooseStyleFirst;
  if (draft.tourScheduleId === null) return GUIDED_DIALOG_LINES.chooseScheduleFirst;
  if (choices.screen !== 'configure') return GUIDED_DIALOG_LINES.openConfigureFirst;
  return GUIDED_DIALOG_LINES.extraUnavailable;
}

function summary({ theme, style, extras }: GuidedVoiceDialogState): string {
  const parts: string[] = [];
  if (theme) parts.push(`여행은 ${THEME_SPOKEN_NAMES[theme]}`);
  if (style) parts.push(`스타일은 ${STYLE_SPOKEN_NAMES[style]}`);
  parts.push(...extras.map((extra) => EXTRA_SPOKEN_NAMES[extra]));
  return parts.join(', ');
}

function currentProduct({ choices, draft }: GuidedVoiceDialogView) {
  const product = choices.product;
  return product !== undefined && product.id === draft.tourProductId ? product : undefined;
}

function currentTheme(view: GuidedVoiceDialogView): VoiceTheme | null {
  return currentProduct(view)?.theme ?? null;
}

function honorific(customerName: string | null): string {
  const name = customerName?.trim();
  return name ? `${name} 고객님, ` : '';
}

function turn(state: GuidedVoiceDialogState, reply: string): GuidedVoiceDialogTurn {
  return { state, reply, closed: false };
}
