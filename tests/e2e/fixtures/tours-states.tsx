import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';

import '@/app/styles/tokens.css';
import '@/shared/motion/motion.css';
import '@/app/styles/global.css';
import type {
  TourDiscoveryCollectionState,
  TourTheme,
} from '@/features/tour-discovery';
import { tourDiscoveryPreviewStates } from '@/features/tour-discovery/tourDiscovery.preview';
import { ToursPageView } from '@/pages/tours/ToursPage';

const fixtureStates = {
  loading: tourDiscoveryPreviewStates.loading,
  empty: tourDiscoveryPreviewStates.empty,
  'network-error': tourDiscoveryPreviewStates.networkError,
  'fatal-mismatch': tourDiscoveryPreviewStates.fatalMismatch,
  'partial-failure': tourDiscoveryPreviewStates.partialFailure,
  'image-failure': tourDiscoveryPreviewStates.imageFailure,
  refreshing: tourDiscoveryPreviewStates.refreshing,
  stale: tourDiscoveryPreviewStates.stale,
  offline: tourDiscoveryPreviewStates.offline,
} as const satisfies Record<string, TourDiscoveryCollectionState>;

function readFixtureState() {
  const requested = new URLSearchParams(window.location.search).get('state');

  return requested !== null && requested in fixtureStates
    ? fixtureStates[requested as keyof typeof fixtureStates]
    : tourDiscoveryPreviewStates.happy;
}

function ToursStateFixture() {
  const [retryResult, setRetryResult] = useState('idle');

  return (
    <MemoryRouter initialEntries={['/tours']}>
      <ToursPageView
        collectionState={readFixtureState()}
        focusedTheme={null}
        onRetry={() => setRetryResult('collection-retry')}
        onRetryTheme={(theme: TourTheme) => setRetryResult(`theme-retry:${theme}`)}
      />
      <output data-testid="tours-retry-result">{retryResult}</output>
    </MemoryRouter>
  );
}

const rootElement = document.getElementById('tours-state-fixture-root');

if (rootElement === null) {
  throw new Error('Tours state fixture root is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ToursStateFixture />
  </StrictMode>,
);
