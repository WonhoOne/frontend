import { describe, expect, it, vi } from 'vitest';
import { createSharedContractConfigureScenario } from '@/features/configuration';
import { createEmptyReservationDraft, type ReservationDraftV1 } from '@/features/reservation';
import { adaptTourProductDetailDto } from '@/features/tour-detail';
import { adaptTourProductDto } from '@/features/tour-discovery';
import type { VoiceCommand } from '@/integrations/voice';
import {
  GUIDED_DIALOG_LINES,
  INITIAL_GUIDED_VOICE_DIALOG_STATE,
  runGuidedVoiceDialogTurn,
  startGuidedVoiceDialog,
  type GuidedVoiceDialogState,
  type GuidedVoiceDialogView,
} from './guidedVoiceDialog';
import type { LiveVoiceChoices } from './liveVoiceContext';
import type { VoiceBridgeResult } from './voiceCommandBridge';

const honeymoonDto = {
  id: 201,
  name: '허니문 낭만 투어',
  description: 'Test',
  theme: 'HONEYMOON_ROMANCE' as const,
  availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'] as ('CLASSIC' | 'GRAND' | 'PREMIUM')[],
  stylePrices: [{ style: 'PREMIUM' as const, amount: 100, currency: 'KRW' as const }],
};
const trekkingDto = {
  ...honeymoonDto,
  id: 301,
  name: '아웃도어 트레킹 투어',
  theme: 'OUTDOOR_TREKKING' as const,
};
const honeymoon = adaptTourProductDto(honeymoonDto);
const honeymoonDetail = adaptTourProductDetailDto(honeymoonDto);

function view(
  screen: LiveVoiceChoices['screen'],
  draft: Partial<ReservationDraftV1> = {},
  extra: Partial<LiveVoiceChoices> = {},
  customerName: string | null = '홍길동',
): GuidedVoiceDialogView {
  return {
    customerName,
    draft: { ...createEmptyReservationDraft(1), ...draft },
    choices: {
      screen,
      products: [honeymoon, adaptTourProductDto(trekkingDto)],
      product: screen === 'discovery' ? undefined : honeymoonDetail,
      schedules: [],
      scenario: createSharedContractConfigureScenario(),
      ...extra,
    },
  };
}

function deps(current: GuidedVoiceDialogView, fail: VoiceCommand['command'][] = []) {
  const executed: VoiceCommand[] = [];
  const execute = vi.fn((command: VoiceCommand): VoiceBridgeResult => {
    executed.push(command);
    return fail.includes(command.command)
      ? { ok: false, command: command.command, error: { code: 'CAPABILITY_FAILED' } }
      : { ok: true, command: command.command };
  });
  return { executed, deps: { getView: () => current, execute } };
}

const started: GuidedVoiceDialogState = { ...INITIAL_GUIDED_VOICE_DIALOG_STATE, started: true };

describe('greeting', () => {
  it('greets the logged-in customer by name', () => {
    expect(startGuidedVoiceDialog('홍길동').reply).toBe(
      '안녕하세요, 홍길동 고객님, 어떤 여행 상품을 예약하시겠습니까?',
    );
  });
  it('omits the name when nobody is logged in', () => {
    expect(startGuidedVoiceDialog(null).reply).toBe(
      '안녕하세요, 어떤 여행 상품을 예약하시겠습니까?',
    );
  });
});

describe('script turns', () => {
  it('asks for the occasion on 추천 and congratulates without changing anything', () => {
    const { executed, deps: d } = deps(view('discovery'));
    expect(runGuidedVoiceDialogTurn(started, { kind: 'RECOMMEND' }, d).reply).toBe(
      '무슨 기념일인가요?',
    );
    expect(runGuidedVoiceDialogTurn(started, { kind: 'CELEBRATION' }, d).reply).toBe(
      '정말 축하드려요. 허니문 낭만 투어 또는 아웃도어 트레킹 투어는 어떠세요?',
    );
    expect(executed).toEqual([]);
  });

  it('selects the only matching product on discovery and suggests PREMIUM', () => {
    const { executed, deps: d } = deps(view('discovery'));
    const turn = runGuidedVoiceDialogTurn(
      started,
      { kind: 'CHOOSE_THEME', theme: 'HONEYMOON_ROMANCE' },
      d,
    );
    expect(executed).toEqual([
      { version: 1, command: 'SELECT_TOUR_PRODUCT', args: { tourProductId: 201 } },
    ]);
    expect(turn.reply).toBe(
      '허니문 낭만 투어 알겠습니다. 그리고 스타일은 프리미엄 스타일 어떨까요?',
    );
    expect(turn.state.theme).toBe('HONEYMOON_ROMANCE');
  });

  it('suggests GRAND when the product has no PREMIUM style', () => {
    const grandOnly = adaptTourProductDto({
      ...honeymoonDto,
      availableStyles: ['CLASSIC', 'GRAND'],
    });
    const { deps: d } = deps(view('discovery', {}, { products: [grandOnly] }));
    expect(
      runGuidedVoiceDialogTurn(started, { kind: 'CHOOSE_THEME', theme: 'HONEYMOON_ROMANCE' }, d)
        .reply,
    ).toBe('허니문 낭만 투어 알겠습니다. 그리고 스타일은 그랜드 스타일 어떨까요?');
  });

  it('shows the theme list when several products share the theme', () => {
    const second = adaptTourProductDto({ ...honeymoonDto, id: 202, name: '두 번째 허니문' });
    const { executed, deps: d } = deps(view('discovery', {}, { products: [honeymoon, second] }));
    const turn = runGuidedVoiceDialogTurn(
      started,
      { kind: 'CHOOSE_THEME', theme: 'HONEYMOON_ROMANCE' },
      d,
    );
    expect(executed).toEqual([
      { version: 1, command: 'SHOW_TOURS', args: { theme: 'HONEYMOON_ROMANCE' } },
    ]);
    expect(turn.reply).toContain('화면에서 마음에 드는 상품을 골라 주세요');
  });

  it('selects the style and reads back the summary', () => {
    const current = view('detail', { tourProductId: '201' });
    const { executed, deps: d } = deps(current);
    const turn = runGuidedVoiceDialogTurn(
      { ...started, theme: 'HONEYMOON_ROMANCE' },
      { kind: 'CHOOSE_STYLE', style: 'PREMIUM' },
      d,
    );
    expect(executed).toEqual([{ version: 1, command: 'SELECT_STYLE', args: { style: 'PREMIUM' } }]);
    expect(turn.reply).toBe(
      '네, 홍길동 고객님, 여행은 허니문 낭만 투어, 스타일은 프리미엄 스타일로 선택하셨습니다.',
    );
  });

  it('asks for a product first when the style cannot apply yet', () => {
    const { deps: d } = deps(view('discovery'), ['SELECT_STYLE']);
    expect(
      runGuidedVoiceDialogTurn(started, { kind: 'CHOOSE_STYLE', style: 'PREMIUM' }, d).reply,
    ).toBe(GUIDED_DIALOG_LINES.chooseProductFirst);
  });

  it('dispatches one ADD_OPTION per extra and reads back the full summary', () => {
    const current = view('configure', {
      tourProductId: '201',
      tourStyle: 'PREMIUM',
      tourScheduleId: '501',
    });
    const { executed, deps: d } = deps(current);
    const turn = runGuidedVoiceDialogTurn(
      { ...started, theme: 'HONEYMOON_ROMANCE', style: 'PREMIUM' },
      { kind: 'ADD_EXTRAS', extras: ['COFFEE', 'CHAMPAGNE'] },
      d,
    );
    expect(executed).toEqual([
      { version: 1, command: 'ADD_OPTION', args: { extraOption: 'COFFEE' } },
      { version: 1, command: 'ADD_OPTION', args: { extraOption: 'CHAMPAGNE' } },
    ]);
    expect(turn.reply).toBe(
      '네, 홍길동 고객님, 여행은 허니문 낭만 투어, 스타일은 프리미엄 스타일, 커피 1포트, 샴페인 1병 추가하셨습니다.',
    );
  });

  it.each([
    [{ tourProductId: '201', tourStyle: 'PREMIUM' as const }, 'detail', 'chooseScheduleFirst'],
    [
      { tourProductId: '201', tourStyle: 'PREMIUM' as const, tourScheduleId: '501' },
      'detail',
      'openConfigureFirst',
    ],
    [{ tourProductId: '201' }, 'detail', 'chooseStyleFirst'],
    [{}, 'discovery', 'chooseProductFirst'],
  ] as const)(
    'guides the missing GUI step instead of failing silently (%j on %s)',
    (draft, screen, line) => {
      const { deps: d } = deps(view(screen, draft), ['ADD_OPTION']);
      expect(
        runGuidedVoiceDialogTurn(
          started,
          { kind: 'ADD_EXTRAS', extras: ['COFFEE', 'CHAMPAGNE'] },
          d,
        ).reply,
      ).toBe(GUIDED_DIALOG_LINES[line]);
    },
  );

  it('confirms, then closes without submitting anything', () => {
    const { executed, deps: d } = deps(view('configure'));
    expect(runGuidedVoiceDialogTurn(started, { kind: 'CONFIRM' }, d)).toMatchObject({
      reply: '추가로 필요하신 것 있으세요?',
      closed: false,
    });
    const closing = runGuidedVoiceDialogTurn(started, { kind: 'DECLINE' }, d);
    expect(closing).toEqual({
      state: INITIAL_GUIDED_VOICE_DIALOG_STATE,
      reply: '선택하신 내용을 화면에서 확인하신 뒤 Review trip 버튼을 눌러 예약을 진행해 주세요.',
      closed: true,
    });
    expect(executed).toEqual([]);
  });
});
