import { useLayoutEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
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

const productDto = {
  id: 103,
  name: '제주 그린 골프',
  description: 'Test',
  theme: 'GOLF_CHALLENGE' as const,
  availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'] as const,
  stylePrices: [{ style: 'GRAND' as const, amount: 100, currency: 'KRW' as const }],
};

function schedule(id: number, startDate: string, endDate: string, reservable: boolean) {
  return adaptTourScheduleDto(
    {
      id,
      tourId: 103,
      startDate,
      endDate,
      reservable,
      recruitment: { unit: 'PARTICIPANT', currentCount: 0, requiredCount: 3, confirmed: false },
    },
    103,
  );
}

function setup(path: string, draft: ReservationDraftV1 | null = null) {
  vi.stubGlobal('SpeechRecognition', Recognition);
  const client = new QueryClient();
  client.setQueryData(tourDiscoveryQueryKey, [
    adaptTourProductDto({ ...productDto, availableStyles: [...productDto.availableStyles] }),
  ]);
  client.setQueryData(
    tourDetailQueryKey(103),
    adaptTourProductDetailDto({ ...productDto, availableStyles: [...productDto.availableStyles] }),
  );
  client.setQueryData(tourScheduleQueryKey(103), [
    schedule(1300, '2026-12-05', '2026-12-08', false),
    schedule(1301, '2026-12-12', '2026-12-15', true),
    schedule(1302, '2027-12-12', '2027-12-15', true),
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
    { initialEntries: [path] },
  );
  render(
    <QueryClientProvider client={client}>
      <ReservationDraftProvider
        storage={{
          getItem: () => (draft ? JSON.stringify(draft) : null),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        }}
      >
        <RouterProvider router={router} />
      </ReservationDraftProvider>
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start voice' }));
  return { client, router };
}

function hints(): string[] {
  const region = screen.queryByRole('region', { name: 'Try saying' });
  if (!region) return [];
  return within(region)
    .getAllByRole('listitem')
    .map((item) => item.querySelector('[lang="ko"]')?.textContent?.replace(/[“”]/g, '') ?? '');
}

function hint(prefixOrSuffix: RegExp): string {
  const found = hints().find((phrase) => prefixOrSuffix.test(phrase));
  if (found === undefined)
    throw new Error(`No hint matching ${prefixOrSuffix}: ${hints().join(' | ')}`);
  return found;
}

function expectNoInternalIds() {
  for (const phrase of hints()) expect(phrase).not.toMatch(/\b(103|130\d)\b/);
}

it('shows discovery examples that the existing interpreter applies as spoken', () => {
  const { router } = setup('/tours');
  expect(hints()).toEqual(['골프 상품 보여줘', '제주 그린 골프 상품 선택']);
  expectNoInternalIds();

  act(() => Recognition.current.say(hint(/보여줘$/)));
  expect(router.state.location.search).toBe('?theme=GOLF_CHALLENGE');

  act(() => {
    void router.navigate('/tours');
  });
  act(() => Recognition.current.say(hint(/상품 선택$/)));
  expect(observed.tourProductId).toBe('103');
  expect(router.state.location.pathname).toBe('/tours/103');
});

it('walks the detail screen with examples built from selectable schedules only', () => {
  setup('/tours/103');
  // Style/schedule need this product's Draft first, so only the product example is offered.
  expect(hints()).toEqual(['제주 그린 골프 상품 선택']);

  act(() => Recognition.current.say(hint(/상품 선택$/)));
  expect(observed.tourProductId).toBe('103');
  // The first reservable schedule shares 12/12 with a later year, so the year is spoken too.
  expect(hints()).toEqual(['프리미엄 등급 선택', '2026년 12월 12일 일정 선택']);
  expectNoInternalIds();

  act(() => Recognition.current.say(hint(/등급 선택$/)));
  expect(observed.tourStyle).toBe('PREMIUM');
  act(() => Recognition.current.say(hint(/일정 선택$/)));
  expect(observed.tourScheduleId).toBe('1301');

  // After choosing, examples move to the remaining choices instead of repeating the current one.
  expect(hints()).toEqual(['그랜드 등급 선택', '2027년 12월 12일 일정 선택']);
});

it('offers configure examples that pass capacity rules and apply when spoken', () => {
  setup('/tours/103/configure', {
    schemaVersion: 1,
    tourProductId: '103',
    tourScheduleId: '1301',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'HOTEL_4_STAR',
      transportSelectionKey: 'PRIVATE_LUXURY_CAR_2',
      mealSelectionKey: 'LOCAL_RESTAURANT',
      extraSelectionKeys: ['COFFEE'],
    },
    updatedAt: 1,
  });
  // A 2-seat car cannot carry 3, so the participant example stays within capacity.
  expect(hints()).toEqual([
    '인원 1명',
    '호텔 5성급 선택',
    '차량 프리미엄 밴 선택',
    '식사 고급 레스토랑 선택',
    '샴페인 추가',
  ]);

  act(() => Recognition.current.say(hint(/^차량/)));
  expect(observed.configuration.transportSelectionKey).toBe('PREMIUM_VAN_10');
  // With the van, more participants become a valid example.
  act(() => Recognition.current.say(hint(/^인원/)));
  expect(observed.participantCount).toBe(3);
  act(() => Recognition.current.say(hint(/^호텔/)));
  expect(observed.configuration.hotelSelectionKey).toBe('HOTEL_5_STAR');
  act(() => Recognition.current.say(hint(/^식사/)));
  expect(observed.configuration.mealSelectionKey).toBe('PREMIUM_RESTAURANT');
  act(() => Recognition.current.say(hint(/추가$/)));
  expect(observed.configuration.extraSelectionKeys).toEqual(['COFFEE', 'CHAMPAGNE']);
  expect(hints()).toContain('샴페인 빼줘');
  act(() => Recognition.current.say('샴페인 빼줘'));
  expect(observed.configuration.extraSelectionKeys).toEqual(['COFFEE']);
});

it('shows no examples when there is nothing on screen to choose', () => {
  vi.stubGlobal('SpeechRecognition', Recognition);
  const router = createMemoryRouter([{ path: '*', element: <CustomerVoiceControl /> }], {
    initialEntries: ['/tours'],
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ReservationDraftProvider
        storage={{ getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() }}
      >
        <RouterProvider router={router} />
      </ReservationDraftProvider>
    </QueryClientProvider>,
  );
  expect(screen.getByRole('button', { name: 'Start voice' })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Try saying' })).not.toBeInTheDocument();
});
