import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';

import '@/app/styles/tokens.css';
import '@/shared/motion/motion.css';
import '@/app/styles/global.css';
import {
  ConfigureDesktop,
  createContractNeutralConfigureFixture,
  createReadyConfigureRuntimeState,
  type ConfigurationCategory,
  type ConfigureRuntimeState,
  type PriceDisplayModel,
} from '@/features/configuration';
import {
  ReservationDraftProvider,
  RESERVATION_DRAFT_STORAGE_KEY,
  serializeReservationDraft,
  type ReservationDraftStorage,
  type ReservationDraftV1,
} from '@/features/reservation';

class FixtureStorage implements ReservationDraftStorage {
  private readonly values = new Map<string, string>();

  constructor(draft: ReservationDraftV1) {
    this.values.set(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const completeDraft: ReservationDraftV1 = {
  schemaVersion: 2,
  tourProductId: 42,
  tourScheduleId: 7,
  tourStyle: 'GRAND',
  participantCount: 2,
  configuration: {
    hotelSelectionKey: 'fixture:hotel:a',
    transportSelectionKey: 'fixture:transport:a',
    mealSelectionKey: 'fixture:meal:a',
    extraSelectionKeys: [],
  },
  updatedAt: 1,
};

function readState() {
  return new URLSearchParams(window.location.search).get('state') ?? 'ready';
}

function runtimeFor(state: string): ConfigureRuntimeState {
  const runtime = createReadyConfigureRuntimeState();

  switch (state) {
    case 'loading':
      runtime.groups.transport = { status: 'loading' };
      break;
    case '500':
      runtime.groups.transport = { status: 'error', isRetrying: false };
      break;
    case 'partial-failure':
      runtime.groups.transport = { status: 'error', isRetrying: false };
      break;
    case 'invalid':
      runtime.groups.transport = { status: 'invalid' };
      break;
    case 'refreshing':
      runtime.groups.transport = { status: 'refreshing' };
      break;
    case 'stale':
      runtime.groups.transport = { status: 'stale' };
      break;
    case 'offline':
      runtime.connectivity = 'offline';
      break;
  }

  return runtime;
}

function priceFor(state: string): PriceDisplayModel | undefined {
  switch (state) {
    case 'price-loading':
      return { state: 'loading', previousTotalLabel: null };
    case 'price-recalculating':
      return { state: 'recalculating', previousTotalLabel: 'Fixture previous total' };
    case 'price-error':
      return {
        state: 'error',
        previousTotalLabel: 'Fixture previous total',
        message: 'Fixture price refresh failed.',
      };
    default:
      return undefined;
  }
}

function ConfigureStateFixture() {
  const [retryResult, setRetryResult] = useState('idle');
  const [reviewResult, setReviewResult] = useState('idle');
  const state = readState();
  const [storage] = useState(() => new FixtureStorage(completeDraft));
  const runtimeState = runtimeFor(state);
  const price = priceFor(state);

  return (
    <ReservationDraftProvider now={() => 10} storage={storage}>
      <MemoryRouter initialEntries={['/tours/42/configure']}>
        <main>
          <ConfigureDesktop
            onRetryGroup={(category: ConfigurationCategory) => setRetryResult(`group:${category}`)}
            onRetryPrice={() => setRetryResult('price')}
            onReview={() => setReviewResult('review')}
            participantRule="general"
            {...(price === undefined ? {} : { price })}
            runtimeState={runtimeState}
            scenario={createContractNeutralConfigureFixture()}
            tourProductId={42}
          />
        </main>
        <output data-testid="configure-retry-result">{retryResult}</output>
        <output data-testid="configure-review-result">{reviewResult}</output>
      </MemoryRouter>
    </ReservationDraftProvider>
  );
}

const rootElement = document.getElementById('configure-state-fixture-root');

if (rootElement === null) {
  throw new Error('Configure state fixture root is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ConfigureStateFixture />
  </StrictMode>,
);
