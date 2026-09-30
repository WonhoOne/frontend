import { useState } from 'react';
import { useParams } from 'react-router';

import { routeBuilders, routePaths } from '@/app/router/paths';
import { LoadingState } from '@/app/state';
import {
  findTourDetailPreview,
  IncludedExperienceSection,
  TourDetailHero,
  type TourDetailCoreErrorReason,
  type TourDetailCoreState,
  TourDetailSkeleton,
  TourDetailStory,
  TourStyleSelection,
  type TourDetailModel,
  type TourDetailStyle,
} from '@/features/tour-detail';
import { Button, PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/tour-detail/TourDetailPage.module.css';

interface TourDetailPageViewProps {
  coreState: TourDetailCoreState;
  onRetry?: () => void;
}

const coreErrorCopy: Record<TourDetailCoreErrorReason, { title: string; message: string }> = {
  network: {
    title: "We couldn't load this journey.",
    message: 'Check your connection and try again.',
  },
  server: {
    title: "We couldn't load this journey.",
    message: 'Please try again shortly.',
  },
  'data-mismatch': {
    title: "We couldn't prepare this journey.",
    message: 'The tour data could not be displayed safely. Try again to reload it.',
  },
};

function TourDetailStatePage({
  isRetrying = false,
  message,
  onRetry,
  title,
}: {
  title: string;
  message: string;
  isRetrying?: boolean;
  onRetry?: () => void;
}) {
  return (
    <PageContainer className={styles.statePage ?? ''} variant="main">
      <div className={styles.stateCard}>
        <p className={styles.eyebrow}>Tour detail</p>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className={styles.actions}>
          {onRetry !== undefined ? (
            <Button isLoading={isRetrying} loadingLabel="Trying again" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
          <TextLink to={routePaths.tours}>Browse tours</TextLink>
        </div>
      </div>
    </PageContainer>
  );
}

function TourDetailReadyView({ tour }: { tour: TourDetailModel }) {
  const [selectedStyle, setSelectedStyle] = useState<TourDetailStyle | null>(null);

  return (
    <div className={styles.page}>
      <TourDetailHero backHref={routeBuilders.toursByTheme(tour.theme)} tour={tour} />
      <TourDetailStory tour={tour} />
      <IncludedExperienceSection tour={tour} />
      <TourStyleSelection
        availableStyles={tour.availableStyles}
        onChange={setSelectedStyle}
        selectedStyle={selectedStyle}
      />

      <footer className={styles.footer}>
        <PageContainer className={styles.footerInner ?? ''} variant="wide">
          <div>
            <p className={styles.footerBrand}>Mister World</p>
            <p className={styles.footerNote}>
              Choose a style now. Schedule and trip configuration come next.
            </p>
          </div>
          <TextLink to={routeBuilders.toursByTheme(tour.theme)}>
            Back to {tour.themeLabel} journeys
          </TextLink>
        </PageContainer>
      </footer>
    </div>
  );
}

export function TourDetailPageView({ coreState, onRetry }: TourDetailPageViewProps) {
  if (coreState.status === 'loading') {
    return (
      <div className={styles.page}>
        <h1 className={styles.visuallyHidden}>Loading tour details</h1>
        <LoadingState label="Loading tour details">
          <TourDetailSkeleton />
        </LoadingState>
      </div>
    );
  }

  if (coreState.status === 'not-found') {
    return (
      <div className={styles.page}>
        <TourDetailStatePage
          message="This TourProduct may no longer be available, or the address may be incorrect."
          title="This journey couldn't be found."
        />
      </div>
    );
  }

  if (coreState.status === 'error') {
    const copy = coreErrorCopy[coreState.reason];

    return (
      <div className={styles.page}>
        <TourDetailStatePage
          isRetrying={coreState.isRetrying ?? false}
          message={copy.message}
          {...(onRetry !== undefined ? { onRetry } : {})}
          title={copy.title}
        />
      </div>
    );
  }

  const { tour } = coreState;

  return <TourDetailReadyView key={tour.id} tour={tour} />;
}

export function TourDetailPage() {
  const { tourId } = useParams();
  const tour = tourId === undefined ? null : findTourDetailPreview(tourId);

  return (
    <TourDetailPageView
      coreState={tour === null ? { status: 'not-found' } : { status: 'ready', tour }}
    />
  );
}
