import { StrictMode, useLayoutEffect } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigureDesktop, createSharedContractConfigureScenario } from '@/features/configuration';
import {
  createEmptyReservationDraft,
  ReservationDraftProvider,
  useReservationDraft,
  type ReservationDraftV1,
} from '@/features/reservation';
import { adaptTourProductDetailDto, adaptTourScheduleDto } from '@/features/tour-detail';
import { createBrowserSpeechRecognitionAdapter } from '@/integrations/voice';
import type {
  BrowserSpeechRecognition,
  BrowserSpeechRecognitionResultEvent,
} from '@/integrations/voice/browserSpeechRecognitionAdapter';
import { LiveVoiceControl } from './LiveVoiceControl';
import type { LiveVoiceChoices } from './liveVoiceContext';

class Recognition implements BrowserSpeechRecognition {
  static instances: Recognition[] = [];
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  onstart: (() => void) | null = null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  constructor() {
    Recognition.instances.push(this);
  }
  start() {
    this.onstart?.();
  }
  stop() {
    this.onend?.();
  }
  abort = vi.fn(() => this.onend?.());
  say(transcript: string, isFinal = true) {
    this.onresult?.({
      resultIndex: 0,
      results: {
        length: 1,
        0: {
          length: 1,
          isFinal,
          0: { transcript },
        },
      },
    });
  }
}
const createAdapter = () =>
  createBrowserSpeechRecognitionAdapter({ getConstructor: () => Recognition });
const product = adaptTourProductDetailDto({
  id: 103,
  name: '제주 골프 여행',
  theme: 'GOLF_CHALLENGE',
  description: 'Test',
  availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
  stylePrices: [{ style: 'PREMIUM', amount: 100, currency: 'KRW' }],
});
const schedule = adaptTourScheduleDto(
  {
    id: 1301,
    tourId: 103,
    startDate: '2027-03-10',
    endDate: '2027-03-14',
    reservable: true,
    recruitment: { unit: 'PARTICIPANT', currentCount: 0, requiredCount: 3, confirmed: false },
  },
  103,
);
function choices(): LiveVoiceChoices {
  return {
    products: [],
    product,
    schedules: [schedule],
    screen: 'configure',
    scenario: createSharedContractConfigureScenario(),
  };
}
function readyDraft(): ReservationDraftV1 {
  return {
    ...createEmptyReservationDraft(1),
    tourProductId: '103',
    tourStyle: 'PREMIUM',
    tourScheduleId: '1301',
  };
}
let observed: ReservationDraftV1;
function Gui() {
  const { draft, dispatch } = useReservationDraft();
  useLayoutEffect(() => {
    observed = draft;
  }, [draft]);
  return (
    <>
      <button
        onClick={() => dispatch({ type: 'SET_EXTRAS', selectionKeys: ['CHAMPAGNE'], updatedAt: 2 })}
      >
        GUI Champagne
      </button>
      <ConfigureDesktop
        participantRule="general"
        scenario={createSharedContractConfigureScenario()}
        tourProductId="103"
        onReview={() => undefined}
      />
    </>
  );
}
function mount(
  initial: ReservationDraftV1 = readyDraft(),
  getChoices = choices,
  adapter = createAdapter,
) {
  const onProductSelected = vi.fn();
  const showTours = vi.fn();
  const storage = { getItem: () => JSON.stringify(initial), setItem: vi.fn(), removeItem: vi.fn() };
  const view = render(
    <StrictMode>
      <ReservationDraftProvider storage={storage}>
        <LiveVoiceControl
          getChoices={getChoices}
          createAdapter={adapter}
          showTours={showTours}
          onProductSelected={onProductSelected}
        />
        <Gui />
      </ReservationDraftProvider>
    </StrictMode>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
  const recognition = Recognition.instances.at(-1);
  return { ...view, recognition: recognition!, onProductSelected, showTours };
}
function say(recognition: Recognition, text: string, final = true) {
  act(() => recognition.say(text, final));
}

describe('live Runtime → Interpreter → V6-A/B → Provider → GUI', () => {
  it('connects SHOW_TOURS and SELECT_THEME to discovery without mutating Draft', () => {
    const { recognition, showTours } = mount();
    const before = observed;
    say(recognition, '상품 보여줘');
    expect(showTours).toHaveBeenLastCalledWith(undefined);
    say(recognition, '골프 테마 선택');
    expect(showTours).toHaveBeenLastCalledWith('GOLF_CHALLENGE');
    expect(observed).toBe(before);
  });

  it('executes all nine Draft commands with canonical identity and Shared selection keys', () => {
    const { recognition, onProductSelected } = mount(createEmptyReservationDraft(1));
    say(recognition, '상품 제주 골프 여행 선택');
    expect(observed.tourProductId).toBe('103');
    expect(onProductSelected).toHaveBeenCalledWith('103');
    say(recognition, '프리미엄 스타일 선택');
    expect(observed.tourStyle).toBe('PREMIUM');
    say(recognition, '2027년 3월 10일 일정 선택');
    expect(observed.tourScheduleId).toBe('1301');
    say(recognition, '인원 2명');
    expect(observed.participantCount).toBe(2);
    say(recognition, '5성급 호텔로 변경');
    expect(observed.configuration.hotelSelectionKey).toBe('HOTEL_5_STAR');
    say(recognition, '차량 프리미엄 밴 선택');
    expect(observed.configuration.transportSelectionKey).toBe('PREMIUM_VAN_10');
    say(recognition, '식사 고급 레스토랑 선택');
    expect(observed.configuration.mealSelectionKey).toBe('PREMIUM_RESTAURANT');
    say(recognition, '샴페인 추가');
    expect(observed.configuration.extraSelectionKeys).toEqual(['CHAMPAGNE']);
    // Same browser event turn must see committed Draft, even without a React yield.
    act(() => {
      recognition.say('커피 추가');
      recognition.say('샴페인 추가');
      recognition.say('커피 추가');
    });
    expect(observed.configuration.extraSelectionKeys).toEqual(['CHAMPAGNE', 'COFFEE']);
    const before = observed;
    say(recognition, '커피 추가');
    expect(observed).toBe(before);
    expect(screen.getByRole('checkbox', { name: /Coffee/ })).toBeChecked();
    say(recognition, '샴페인 제거');
    expect(observed.configuration.extraSelectionKeys).toEqual(['COFFEE']);
    say(recognition, '커피 제거');
    expect(observed.configuration.extraSelectionKeys).toEqual([]);
    expect(screen.getByRole('checkbox', { name: /Champagne/ })).not.toBeChecked();
  });

  it('uses latest GUI Draft and never resurrects removed Premium Champagne across remount', () => {
    const first = mount();
    fireEvent.click(screen.getByRole('button', { name: 'GUI Champagne' }));
    say(first.recognition, '샴페인 제거');
    expect(observed.configuration.extraSelectionKeys).toEqual([]);
    say(first.recognition, '커피 추가');
    expect(screen.getByRole('checkbox', { name: /Coffee/ })).toBeChecked();
    const saved = observed;
    first.unmount();
    const second = mount(saved);
    say(second.recognition, '프리미엄 스타일 선택');
    say(second.recognition, '인원 4명');
    expect(observed.configuration.extraSelectionKeys).toEqual(['COFFEE']);
  });

  it('reads changed Product/Schedule models for every final transcript', () => {
    let current = choices();
    const { recognition } = mount(readyDraft(), () => current);
    current = {
      ...current,
      product: { ...product, name: '새로운 제주 상품' },
      schedules: [
        {
          ...schedule,
          selectionKey: '1302',
          calendar: { tourProductId: 103, startDate: '2028-04-11', endDate: '2028-04-15' },
        },
      ],
    };
    say(recognition, '상품 새로운 제주 상품 선택');
    say(recognition, '2028년 4월 11일 일정 선택');
    expect(observed.tourScheduleId).toBe('1302');
    const before = observed;
    say(recognition, '2027년 3월 10일 일정 선택');
    expect(observed).toBe(before);
  });

  it('rejects unavailable/unknown options and invalid schedules, but allows selected Extra removal', () => {
    let current = choices();
    const { recognition } = mount(readyDraft(), () => current);
    current = {
      ...current,
      schedules: [{ ...schedule, isSelectable: false }],
      scenario: {
        ...current.scenario,
        groups: current.scenario.groups.map((group) => ({
          ...group,
          options: group.options.map((option) => ({
            ...option,
            availability: { status: 'disabled', reason: 'Test' },
          })),
        })),
      },
    };
    const before = observed;
    for (const text of [
      '커피 추가',
      '5성급 호텔로 변경',
      '2027년 3월 10일 일정 선택',
      '예약 제출',
      '무슨 말일까요',
    ])
      say(recognition, text);
    expect(observed).toBe(before);
    fireEvent.click(screen.getByRole('button', { name: 'GUI Champagne' }));
    say(recognition, '샴페인 추가');
    expect(screen.getByRole('status')).toHaveTextContent('unavailable');
    say(recognition, '샴페인 제거');
    expect(observed.configuration.extraSelectionKeys).toEqual([]);
    current = { ...current, scenario: { ...current.scenario, groups: [] } };
    say(recognition, '샴페인 제거');
    expect(screen.getByRole('status')).toHaveTextContent('unavailable');
    // Failure never disables the independent GUI.
    fireEvent.click(screen.getByRole('checkbox', { name: /Coffee/ }));
    expect(observed.configuration.extraSelectionKeys).toEqual(['COFFEE']);
  });

  it('never executes interim transcripts and cleans up StrictMode/unmount/remount delivery', () => {
    const first = mount();
    say(first.recognition, '커피 추가', false);
    expect(observed.configuration.extraSelectionKeys).toEqual([]);
    const late = first.recognition.onresult;
    first.unmount();
    expect(first.recognition.abort).toHaveBeenCalledTimes(1);
    expect(first.recognition.onresult).toBeNull();
    const second = mount();
    act(() =>
      late?.({
        resultIndex: 0,
        results: { length: 1, 0: { isFinal: true, length: 1, 0: { transcript: '샴페인 추가' } } },
      }),
    );
    expect(observed.configuration.extraSelectionKeys).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Stop voice' }));
    expect(screen.getByRole('status')).toHaveTextContent('Voice stopped');
    say(second.recognition, '커피 추가');
    expect(observed.configuration.extraSelectionKeys).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
    say(Recognition.instances.at(-1)!, '커피 추가');
    expect(observed.configuration.extraSelectionKeys).toEqual(['COFFEE']);
  });

  it('reports unsupported/recognition/runtime failures without blocking GUI', () => {
    const unsupported = mount(readyDraft(), choices, () =>
      createBrowserSpeechRecognitionAdapter({ getConstructor: () => undefined }),
    );
    expect(screen.getByRole('status')).toHaveTextContent('unavailable in this browser');
    fireEvent.click(screen.getByRole('button', { name: 'GUI Champagne' }));
    expect(observed.configuration.extraSelectionKeys).toEqual(['CHAMPAGNE']);
    unsupported.unmount();
    let failContext = false;
    const live = mount(readyDraft(), () => {
      if (failContext) throw new Error();
      return choices();
    });
    for (const error of [
      'not-allowed',
      'audio-capture',
      'no-speech',
      'network',
      'aborted',
      'unknown',
    ]) {
      act(() => {
        Recognition.instances.at(-1)!.onerror?.({ error });
        Recognition.instances.at(-1)!.onend?.();
      });
      expect(screen.getByRole('status')).toHaveTextContent('recognition failed');
      fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
    }
    failContext = true;
    say(Recognition.instances.at(-1)!, '커피 추가');
    expect(screen.getByRole('status')).toHaveTextContent('context is unavailable');
    expect(observed.configuration.extraSelectionKeys).toEqual([]);
    expect(
      within(screen.getByRole('group', { name: 'Extras' })).getByRole('checkbox', {
        name: /Coffee/,
      }),
    ).toBeEnabled();
    live.unmount();
  });
  it('owns exactly one subscribed runtime after StrictMode replay and detaches on unmount', () => {
    const adapters: ReturnType<typeof createBrowserSpeechRecognitionAdapter>[] = [];
    const subscriptions: { mock: { calls: unknown[] } }[] = [];
    const aborts: { mock: { calls: unknown[] } }[] = [];
    const countedAdapter = () => {
      const adapter = createAdapter();
      adapters.push(adapter);
      subscriptions.push(vi.spyOn(adapter, 'subscribe'));
      aborts.push(vi.spyOn(adapter, 'abort'));
      return adapter;
    };
    const view = mount(readyDraft(), choices, countedAdapter);
    expect(adapters).toHaveLength(2);
    expect(subscriptions.map((spy) => spy.mock.calls.length)).toEqual([1, 1]);
    expect(aborts.map((spy) => spy.mock.calls.length)).toEqual([1, 0]);
    const before = observed;
    say(view.recognition, '인원 4명');
    expect(observed.participantCount).toBe(4);
    expect(observed).not.toBe(before);
    view.unmount();
    expect(aborts.map((spy) => spy.mock.calls.length)).toEqual([1, 1]);
    expect(view.recognition.onresult).toBeNull();
    expect(view.recognition.onend).toBeNull();
  });
});
