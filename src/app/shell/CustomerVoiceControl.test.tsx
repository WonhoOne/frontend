import { useLayoutEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
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
import type { BrowserSpeechRecognitionResultEvent } from '@/integrations/voice/browserSpeechRecognitionAdapter';
import { CustomerVoiceControl } from './CustomerVoiceControl';

class Recognition {
  static current: Recognition;
  onstart: (() => void) | null = null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null = null;
  onend: (() => void) | null = null;
  start() {
    Recognition.current = this;
    this.onstart?.();
  }
  abort() {
    this.onend?.();
  }
  say(transcript: string) {
    this.onresult?.({
      resultIndex: 0,
      results: { length: 1, 0: { isFinal: true, length: 1, 0: { transcript } } },
    });
  }
}

let observed: ReservationDraftV1;
function Probe() {
  const { draft } = useReservationDraft();
  useLayoutEffect(() => {
    observed = draft;
  }, [draft]);
  return null;
}
afterEach(() => vi.unstubAllGlobals());

it('reads the current public Query cache per callback without Voice HTTP, and uses discovery navigation', () => {
  vi.stubGlobal('SpeechRecognition', Recognition);
  const client = new QueryClient();
  const product = adaptTourProductDetailDto({
    id: 103,
    name: '기존 상품',
    description: 'Test',
    theme: 'GOLF_CHALLENGE',
    availableStyles: ['GRAND', 'PREMIUM'],
    stylePrices: [{ style: 'GRAND', amount: 100, currency: 'KRW' }],
  });
  client.setQueryData(tourDetailQueryKey(103), product);
  client.setQueryData(tourScheduleQueryKey(103), []);
  const initial = {
    schemaVersion: 1,
    tourProductId: '103',
    tourScheduleId: '1301',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'HOTEL_4_STAR',
      mealSelectionKey: 'LOCAL_RESTAURANT',
      transportSelectionKey: 'PREMIUM_VAN_10',
      extraSelectionKeys: [],
    },
    updatedAt: 1,
  };
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
    { initialEntries: ['/tours/103/configure'] },
  );
  render(
    <QueryClientProvider client={client}>
      <ReservationDraftProvider
        storage={{ getItem: () => JSON.stringify(initial), setItem: vi.fn(), removeItem: vi.fn() }}
      >
        <RouterProvider router={router} />
      </ReservationDraftProvider>
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
  const recognition = Recognition.current;
  // The shell has no useQuery subscription: this update must still be read on the next final.
  client.setQueryData(tourDetailQueryKey(103), { ...product, name: '변경된 상품' });
  client.setQueryData(tourScheduleQueryKey(103), [
    adaptTourScheduleDto(
      {
        id: 1302,
        tourId: 103,
        startDate: '2028-04-11',
        endDate: '2028-04-15',
        reservable: true,
        recruitment: { unit: 'PARTICIPANT', currentCount: 0, requiredCount: 3, confirmed: false },
      },
      103,
    ),
  ]);
  act(() => recognition.say('상품 변경된 상품 선택'));
  expect(router.state.location.pathname).toBe('/tours/103/configure');
  act(() => recognition.say('2028년 4월 11일 일정 선택'));
  expect(observed.tourScheduleId).toBe('1302');
  act(() => recognition.say('커피 추가'));
  expect(observed.configuration.extraSelectionKeys).toEqual(['COFFEE']);
  expect(
    client
      .getQueryCache()
      .getAll()
      .every((query) => query.state.fetchStatus === 'idle'),
  ).toBe(true);
  const before = observed;
  act(() => recognition.say('골프 테마 선택'));
  expect(router.state.location.pathname).toBe('/tours');
  expect(router.state.location.search).toBe('?theme=GOLF_CHALLENGE');
  expect(observed).toBe(before);
  act(() => recognition.say('상품 보여줘'));
  expect(router.state.location.search).toBe('');
  act(() => {
    void router.navigate('/reservation/review');
  });
  expect(screen.queryByRole('button', { name: 'Start voice' })).not.toBeInTheDocument();
  expect(recognition.onresult).toBeNull();
  act(() => recognition.say('샴페인 추가'));
  expect(observed).toBe(before);
});

it.each(['HONEYMOON_ROMANCE', 'UNKNOWN'])(
  'keeps all visible discovery products selectable when theme focus is %s',
  (theme) => {
    vi.stubGlobal('SpeechRecognition', Recognition);
    const client = new QueryClient();
    client.setQueryData(tourDiscoveryQueryKey, [
      adaptTourProductDto({
        id: 103,
        name: '골프 상품',
        description: 'Test',
        theme: 'GOLF_CHALLENGE',
        availableStyles: ['GRAND'],
        stylePrices: [{ style: 'GRAND', amount: 100, currency: 'KRW' }],
      }),
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
      { initialEntries: ['/tours?theme=' + theme] },
    );
    render(
      <QueryClientProvider client={client}>
        <ReservationDraftProvider
          storage={{ getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() }}
        >
          <RouterProvider router={router} />
        </ReservationDraftProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
    act(() => Recognition.current.say('상품 103 선택'));
    expect(observed.tourProductId).toBe('103');
    expect(router.state.location.pathname).toBe('/tours/103');
  },
);
