import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import {
  tourDetailDataSource,
  tourScheduleDataSource,
} from '@/app/providers/tourDetailDataSources';
import { routeBuilders, routePaths } from '@/app/router/paths';
import { LoadingState } from '@/app/state';
import {
  findTourSchedulePreview,
  toTourDetailCoreState,
  toTourScheduleSectionState,
  IncludedExperienceSection,
  TourDetailHero,
  type TourDetailCoreErrorReason,
  type TourDetailCoreState,
  type TourDetailDataSource,
  TourDetailSkeleton,
  TourDetailStory,
  TourScheduleSection,
  TourStyleSelection,
  type TourDetailModel,
  type TourDetailStyle,
  type TourScheduleDataSource,
  type TourScheduleSectionState,
  useTourDetail,
  useTourSchedules,
} from '@/features/tour-detail';
import {
  createConfigureHandoffAction,
  type ConfigureHandoffIntent,
  useReservationDraft,
} from '@/features/reservation';
import { parseResourceIdRouteParam } from '@/shared/lib/resourceIdentity';
import { Button, PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/tour-detail/TourDetailPage.module.css';

interface TourDetailPageViewProps {
  coreState: TourDetailCoreState;
  scheduleState?: TourScheduleSectionState;
  onRetry?: () => void;
  onRetrySchedule?: () => void;
  onConfigure?: (intent: ConfigureHandoffIntent) => void;
}

const styleSummaryLabel: Record<TourDetailStyle, string> = {
  CLASSIC: 'Classic',
  GRAND: 'Grand',
  PREMIUM: 'Premium',
};

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

function TourDetailReadyView({
  onConfigure,
  onRetrySchedule,
  scheduleState,
  tour,
}: {
  tour: TourDetailModel;
  scheduleState?: TourScheduleSectionState;
  onRetrySchedule?: () => void;
  onConfigure?: (intent: ConfigureHandoffIntent) => void;
}) {
  const [selectedStyle, setSelectedStyle] = useState<TourDetailStyle | null>(null);
  const [selectedScheduleKey, setSelectedScheduleKey] = useState<number | null>(null);
  const resolvedScheduleState = scheduleState ?? findTourSchedulePreview(tour);

  const effectiveScheduleKey =
    resolvedScheduleState.status === 'ready' &&
    resolvedScheduleState.choices.some(
      (choice) => choice.selectionKey === selectedScheduleKey && choice.isSelectable,
    )
      ? selectedScheduleKey
      : null;

  const selectedScheduleChoice =
    resolvedScheduleState.status === 'ready' && effectiveScheduleKey !== null
      ? (resolvedScheduleState.choices.find(
          (choice) => choice.selectionKey === effectiveScheduleKey,
        ) ?? null)
      : null;

  const canConfigure =
    selectedStyle !== null && selectedScheduleChoice !== null && onConfigure !== undefined;

  const configureHelp =
    selectedStyle === null
      ? 'Choose a tour style before continuing.'
      : effectiveScheduleKey === null
        ? 'Choose an available schedule before continuing.'
        : 'Your selected style and schedule will carry into trip configuration.';

  function handleConfigure() {
    if (selectedStyle === null || effectiveScheduleKey === null || onConfigure === undefined) {
      return;
    }

    onConfigure({
      tourProductId: tour.id,
      tourStyle: selectedStyle,
      tourScheduleId: effectiveScheduleKey,
    });
  }

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
      <TourScheduleSection
        onChange={setSelectedScheduleKey}
        {...(onRetrySchedule !== undefined ? { onRetry: onRetrySchedule } : {})}
        scheduleState={resolvedScheduleState}
        selectedScheduleKey={effectiveScheduleKey}
      />

      <section aria-labelledby="tour-configure-title" className={styles.configureAction}>
        <PageContainer className={styles.configureActionInner ?? ''} variant="wide">
          <div className={styles.configureCopy}>
            <p className={styles.eyebrow}>Selected trip</p>
            <h2 id="tour-configure-title">Shape the trip around your choices.</h2>
            <dl className={styles.selectionSummary}>
              <div>
                <dt>Theme</dt>
                <dd>{tour.themeLabel}</dd>
              </div>
              <div>
                <dt>Style</dt>
                <dd>
                  {selectedStyle === null ? 'Not selected' : styleSummaryLabel[selectedStyle]}
                </dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>{selectedScheduleChoice?.dateLabel ?? 'Not selected'}</dd>
              </div>
            </dl>
            <p id="tour-configure-help">{configureHelp}</p>
          </div>
          <Button
            aria-describedby="tour-configure-help"
            className={styles.configureButton ?? ''}
            disabled={!canConfigure}
            onClick={handleConfigure}
            size="large"
          >
            Configure this trip
          </Button>
        </PageContainer>
      </section>

      <footer className={styles.footer}>
        <PageContainer className={styles.footerInner ?? ''} variant="wide">
          <div>
            <p className={styles.footerBrand}>Mister World</p>
            <p className={styles.footerNote}>
              Your selected style and schedule stay with you as you configure the trip.
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

export function TourDetailPageView({
  coreState,
  onConfigure,
  onRetry,
  onRetrySchedule,
  scheduleState,
}: TourDetailPageViewProps) {
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

  return (
    <TourDetailReadyView
      key={tour.id}
      {...(onConfigure !== undefined ? { onConfigure } : {})}
      {...(onRetrySchedule !== undefined ? { onRetrySchedule } : {})}
      {...(scheduleState !== undefined ? { scheduleState } : {})}
      tour={tour}
    />
  );
}

interface ResolvedTourDetailPageProps {
  detailDataSource: TourDetailDataSource;
  resourceId: number;
  scheduleDataSource: TourScheduleDataSource;
}

function ResolvedTourDetailPage({
  detailDataSource,
  resourceId,
  scheduleDataSource,
}: ResolvedTourDetailPageProps) {
  const navigate = useNavigate();
  const { dispatch } = useReservationDraft();
  const detailQuery = useTourDetail(detailDataSource, resourceId);
  const scheduleQuery = useTourSchedules(scheduleDataSource, resourceId);
  const coreState = toTourDetailCoreState(detailQuery);
  const scheduleState = toTourScheduleSectionState(scheduleQuery);

  function handleConfigure(intent: ConfigureHandoffIntent) {
    dispatch(createConfigureHandoffAction(intent, Date.now()));
    void navigate(routeBuilders.configure(intent.tourProductId));
  }

  return (
    <TourDetailPageView
      coreState={coreState}
      onConfigure={handleConfigure}
      onRetry={() => {
        void detailQuery.refetch();
      }}
      onRetrySchedule={() => {
        void scheduleQuery.refetch();
      }}
      scheduleState={scheduleState}
    />
  );
}

export interface TourDetailPageProps {
  detailDataSource?: TourDetailDataSource;
  scheduleDataSource?: TourScheduleDataSource;
}

export function TourDetailPage({
  detailDataSource = tourDetailDataSource,
  scheduleDataSource = tourScheduleDataSource,
}: TourDetailPageProps) {
  const { tourId } = useParams();
  const resourceId = parseResourceIdRouteParam(tourId);

  if (resourceId === null) {
    return <TourDetailPageView coreState={{ status: 'not-found' }} />;
  }

  return (
    <ResolvedTourDetailPage
      detailDataSource={detailDataSource}
      resourceId={resourceId}
      scheduleDataSource={scheduleDataSource}
    />
  );
}
