import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/app/styles/tokens.css';
import '@/shared/motion/motion.css';
import '@/app/styles/global.css';
import {
  EmptyState,
  LoadingState,
  OfflineBanner,
  RefreshIndicator,
  SectionError,
} from '@/app/state';
import { Button, Skeleton } from '@/shared/ui';

function StateFixture() {
  const [retryRequested, setRetryRequested] = useState(false);

  return (
    <main
      style={{
        display: 'grid',
        gap: '24px',
        maxWidth: '760px',
        padding: '24px',
      }}
    >
      <LoadingState label="Loading fixture">
        <Skeleton data-testid="fixture-skeleton" style={{ blockSize: '96px' }} variant="block" />
      </LoadingState>

      <SectionError
        onRetry={() => setRetryRequested(true)}
        retryLabel="Retry section"
        retryingLabel="Retrying section"
        title="Section unavailable"
      >
        <p>Other successful content can remain visible.</p>
      </SectionError>

      <output data-testid="retry-result">{retryRequested ? 'retry-requested' : 'idle'}</output>

      <EmptyState action={<Button>Fixture action</Button>} title="Nothing here yet">
        <p>Feature copy stays outside the generic mechanic.</p>
      </EmptyState>

      <OfflineBanner>Offline fixture status.</OfflineBanner>
      <RefreshIndicator label="Refreshing fixture" state="refreshing" />
      <RefreshIndicator label="Stale fixture" state="stale" />
    </main>
  );
}

const rootElement = document.getElementById('state-fixture-root');

if (rootElement === null) {
  throw new Error('State fixture root is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <StateFixture />
  </StrictMode>,
);
