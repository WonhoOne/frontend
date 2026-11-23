import { useLayoutEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '@/features/auth/authContext';
import {
  ReservationDraftProvider,
  useReservationDraft,
  type ReservationDraftV1,
} from '@/features/reservation';
import {
  adaptTourProductDetailDto,
  adaptTourScheduleDto,
  tourDetailQueryKey,
  tourScheduleQueryKey,
} from '@/features/tour-detail';
import { adaptTourProductDto, tourDiscoveryQueryKey } from '@/features/tour-discovery';
import { VOICE_PREPARED_STORAGE_KEY } from '@/features/voice-bridge/voiceReservationConfirmation';
import type { BrowserSpeechRecognitionResultEvent } from '@/integrations/voice/browserSpeechRecognitionAdapter';
import { CustomerVoiceControl } from './CustomerVoiceControl';

/** Chrome-like single-utterance recognition: one instance per listening turn. */
class Recognition {
  static current: Recognition | null = null;
  static started = 0;
  onstart: (() => void) | null = null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  start() {
    Recognition.current = this;
    Recognition.started += 1;
    this.onstart?.();
  }
  abort() {
    if (Recognition.current === this) Recognition.current = null;
    this.onend?.();
  }
  fail(error: string) {
    if (Recognition.current === this) Recognition.current = null;
    this.onerror?.({ error });
    this.onend?.();
  }
  say(transcript: string) {
    this.onresult?.({
      resultIndex: 0,
      results: { length: 1, 0: { isFinal: true, length: 1, 0: { transcript } } },
    });
  }
}

/** speechSynthesis stub: records every spoken line; ends immediately unless held. */
const spoken: string[] = [];
let holdSpeech = false;
let pendingEnd: (() => void) | null = null;
class Utterance {
  lang = '';
  rate = 1;
  voice = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}
const speechSynthesis = {
  speak(utterance: Utterance) {
    spoken.push(utterance.text);
    if (holdSpeech) pendingEnd = () => utterance.onend?.();
    else utterance.onend?.();
  },
  cancel: vi.fn(),
  getVoices: () => [{ lang: 'ko-KR' }],
};

let observed: ReservationDraftV1;
function Probe() {
  const { draft } = useReservationDraft();
  useLayoutEffect(() => {
    observed = draft;
  }, [draft]);
  return null;
}

const honeymoonDto = {
  id: 201,
  name: '허니문 낭만 투어',
  description: 'Test',
  theme: 'HONEYMOON_ROMANCE' as const,
  availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'] as ('CLASSIC' | 'GRAND' | 'PREMIUM')[],
  stylePrices: [{ style: 'PREMIUM' as const, amount: 100, currency: 'KRW' as const }],
};

beforeEach(() => {
  spoken.length = 0;
  holdSpeech = false;
  pendingEnd = null;
  Recognition.current = null;
  Recognition.started = 0;
  vi.stubGlobal('SpeechRecognition', Recognition);
  vi.stubGlobal('speechSynthesis', speechSynthesis);
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  window.sessionStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

function setup(customerName: string | null) {
  const client = new QueryClient();
  client.setQueryData(tourDiscoveryQueryKey, [
    adaptTourProductDto(honeymoonDto),
    adaptTourProductDto({
      ...honeymoonDto,
      id: 301,
      name: '아웃도어 트레킹 투어',
      theme: 'OUTDOOR_TREKKING',
    }),
  ]);
  client.setQueryData(tourDetailQueryKey(201), adaptTourProductDetailDto(honeymoonDto));
  client.setQueryData(tourScheduleQueryKey(201), [
    adaptTourScheduleDto(
      {
        id: 501,
        tourId: 201,
        startDate: '2026-12-24',
        endDate: '2026-12-28',
        reservable: true,
        recruitment: { unit: 'PARTICIPANT', currentCount: 0, requiredCount: 2, confirmed: false },
      },
      201,
    ),
  ]);
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <>
            <CustomerVoiceControl />
            <Probe />
          </>
        ),
      },
    ],
    { initialEntries: ['/tours'] },
  );
  const auth = {
    state:
      customerName === null
        ? { status: 'unauthenticated' }
        : { status: 'authenticated', user: { id: 7, role: 'CUSTOMER', name: customerName } },
    login: vi.fn(),
    signup: vi.fn(),
    invalidateSession: vi.fn(),
    signOut: vi.fn(),
  } satisfies AuthContextValue;
  render(
    <AuthContext.Provider value={auth}>
      <QueryClientProvider client={client}>
        <ReservationDraftProvider
          storage={{ getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() }}
        >
          <RouterProvider router={router} />
        </ReservationDraftProvider>
      </QueryClientProvider>
    </AuthContext.Provider>,
  );
  return { client, router };
}

function customerSays(line: string) {
  const recognition = Recognition.current;
  if (!recognition) throw new Error(`Not listening when the customer said: ${line}`);
  act(() => recognition.say(line));
}

it('performs the whole presentation script; voice never submits the reservation', () => {
  const { router } = setup('홍길동');
  fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
  expect(spoken).toEqual(['안녕하세요, 홍길동 고객님, 어떤 여행 상품을 예약하시겠습니까?']);
  expect(screen.getByLabelText('Voice guide reply')).toHaveTextContent(
    '어떤 여행 상품을 예약하시겠습니까?',
  );

  customerSays('멋진 여행 상품 추천해주세요.');
  expect(spoken.at(-1)).toBe('무슨 기념일인가요?');
  customerSays('다음달 오늘에 결혼해요');
  expect(spoken.at(-1)).toBe(
    '정말 축하드려요. 허니문 낭만 투어 또는 아웃도어 트레킹 투어는 어떠세요?',
  );
  expect(observed.tourProductId).toBeNull();

  customerSays('허니문 낭만 투어 좋겠어요.');
  expect(observed.tourProductId).toBe('201');
  expect(router.state.location.pathname).toBe('/tours/201');
  expect(spoken.at(-1)).toBe(
    '허니문 낭만 투어 알겠습니다. 그리고 스타일은 프리미엄 스타일 어떨까요?',
  );

  customerSays('네, 프리미엄 스타일 좋아요.');
  expect(observed.tourStyle).toBe('PREMIUM');
  expect(spoken.at(-1)).toBe(
    '네, 홍길동 고객님, 여행은 허니문 낭만 투어, 스타일은 프리미엄 스타일로 선택하셨습니다.',
  );

  // Extras need a schedule and the Configure screen; voice explains instead of failing silently.
  customerSays('그리고 식사시 커피 1포트, 샴페인 1병 추가해요.');
  expect(spoken.at(-1)).toBe(
    '커피와 샴페인은 출발 일정을 고른 뒤 추가할 수 있어요. 먼저 화면에서 일정을 선택해 주세요.',
  );
  expect(observed.configuration.extraSelectionKeys).toEqual([]);

  // The presenter picks the date (existing exact grammar) and opens Configure in the GUI.
  customerSays('12월 24일 일정 선택');
  expect(observed.tourScheduleId).toBe('501');
  act(() => {
    void router.navigate('/tours/201/configure');
  });

  customerSays('그리고 식사시 커피 1포트, 샴페인 1병 추가해요.');
  expect(observed.configuration.extraSelectionKeys).toEqual(['COFFEE', 'CHAMPAGNE']);
  expect(spoken.at(-1)).toBe(
    '네, 홍길동 고객님, 여행은 허니문 낭만 투어, 스타일은 프리미엄 스타일, 커피 1포트, 샴페인 1병 추가하셨습니다.',
  );

  customerSays('맞아요.');
  expect(spoken.at(-1)).toBe('추가로 필요하신 것 있으세요?');
  customerSays('없어요.');
  expect(spoken.at(-1)).toBe(
    '선택하신 내용을 화면에서 확인하신 뒤 Review trip 버튼을 눌러 예약을 진행해 주세요.',
  );

  // The dialog ends; the customer still reviews and submits in the GUI.
  expect(Recognition.current).toBeNull();
  expect(screen.getByRole('button', { name: 'Start voice' })).toBeEnabled();
  expect(router.state.location.pathname).toBe('/tours/201/configure');
  expect(observed).toMatchObject({
    tourProductId: '201',
    tourStyle: 'PREMIUM',
    tourScheduleId: '501',
  });
  // Lets the success page speak "12월24일에 …" for this product, once.
  expect(window.sessionStorage.getItem(VOICE_PREPARED_STORAGE_KEY)).toBe('201');
});

it('omits the name for a guest and does not listen while a reply is playing', () => {
  setup(null);
  holdSpeech = true;
  fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
  expect(spoken).toEqual(['안녕하세요, 어떤 여행 상품을 예약하시겠습니까?']);
  // Recognition starts only after the greeting finishes, so the app cannot hear itself.
  expect(Recognition.started).toBe(0);
  act(() => pendingEnd?.());
  expect(Recognition.started).toBe(1);

  customerSays('추천해 주세요');
  expect(spoken.at(-1)).toBe('무슨 기념일인가요?');
  expect(Recognition.current).toBeNull();
  act(() => pendingEnd?.());
  expect(Recognition.started).toBe(2);

  // Stop ends the conversation and any speech; Start greets again.
  fireEvent.click(screen.getByRole('button', { name: 'Stop voice' }));
  expect(Recognition.current).toBeNull();
  expect(screen.getByRole('button', { name: 'Start voice' })).toBeEnabled();
});

it('keeps exact commands working inside the conversation and hints the natural phrase', () => {
  const { router } = setup('홍길동');
  expect(screen.getByRole('region', { name: 'Try saying' })).toHaveTextContent(
    '허니문 낭만 투어 좋겠어요',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
  customerSays('허니문 상품 보여줘');
  expect(router.state.location.search).toBe('?theme=HONEYMOON_ROMANCE');
  expect(spoken).toHaveLength(1);
});

it('resumes the conversation after silence ends recognition, without greeting again', () => {
  setup('홍길동');
  fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
  customerSays('허니문 낭만 투어 좋겠어요');
  // The presenter spends a while in the GUI; Chrome reports no-speech and ends the session.
  act(() => Recognition.current?.fail('no-speech'));
  expect(Recognition.current).toBeNull();
  expect(screen.getByRole('status')).toHaveTextContent('recognition failed');
  const before = spoken.length;
  fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
  expect(spoken).toHaveLength(before);
  customerSays('네, 프리미엄 스타일 좋아요');
  expect(observed.tourStyle).toBe('PREMIUM');
  expect(spoken.at(-1)).toBe(
    '네, 홍길동 고객님, 여행은 허니문 낭만 투어, 스타일은 프리미엄 스타일로 선택하셨습니다.',
  );
});
