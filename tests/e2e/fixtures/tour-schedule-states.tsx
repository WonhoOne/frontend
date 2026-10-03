import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';

import '@/app/styles/tokens.css';
import '@/shared/motion/motion.css';
import '@/app/styles/global.css';
import {
  findTourDetailPreview,
  tourSchedulePreviewStates,
  type TourScheduleSectionState,
} from '@/features/tour-detail';
import { TourDetailPageView } from '@/pages/tour-detail/TourDetailPage';

const fixtureStates = {
  loading: tourSchedulePreviewStates.loading,
  empty: tourSchedulePreviewStates.empty,
  'network-error': tourSchedulePreviewStates.networkError,
  'partial-error': tourSchedulePreviewStates.partialError,
  refreshing: tourSchedulePreviewStates.refreshing,
  stale: tourSchedulePreviewStates.stale,
  unavailable: tourSchedulePreviewStates.unavailable,
} as const satisfies Record<string, TourScheduleSectionState>;

function readFixtureState() {
  const requested = new URLSearchParams(window.location.search).get('state');

  return requested !== null && requested in fixtureStates
    ? fixtureStates[requested as keyof typeof fixtureStates]
    : tourSchedulePreviewStates.partialError;
}

function TourScheduleStateFixture() {
  const [retryResult, setRetryResult] = useState('idle');
  const tour = findTourDetailPreview(103);

  if (tour === null) {
    throw new Error('Tour Detail schedule fixture requires the Golf preview TourProduct.');
  }

  return (
    <MemoryRouter initialEntries={['/tours/103']}>
      <TourDetailPageView
        coreState={{ status: 'ready', tour }}
        onRetrySchedule={() => setRetryResult('schedule-retry')}
        scheduleState={readFixtureState()}
      />
      <output data-testid="schedule-retry-result">{retryResult}</output>
    </MemoryRouter>
  );
}

const rootElement = document.getElementById('tour-schedule-state-fixture-root');

if (rootElement === null) {
  throw new Error('Tour schedule state fixture root is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <TourScheduleStateFixture />
  </StrictMode>,
);
