import { useNavigate, useParams } from 'react-router';

import {
  tourDetailDataSource,
  tourScheduleDataSource,
} from '@/app/providers/tourDetailDataSources';
import { routeBuilders, routePaths } from '@/app/router/paths';
import {
  buildPublicConfigurePrice,
  ConfigureDesktop,
  createContractNeutralConfigureFixture,
  type PriceDisplayModel,
} from '@/features/configuration';
import { type TourDetailModel, useTourDetail, useTourSchedules } from '@/features/tour-detail';
import { getConfigureDraftEntryState, useReservationDraft } from '@/features/reservation';
import {
  parseResourceIdRouteParam,
  toCanonicalBackendResourceIdentity,
  type ResourceId,
} from '@/shared/lib/resourceIdentity';
import { Button, PageContainer, Skeleton, TextLink } from '@/shared/ui';

import styles from '@/pages/configure/ConfigurePage.module.css';

function ProductLoadingState() {
  return (
    <PageContainer variant="reading">
      <section aria-busy="true" aria-label="Loading trip configuration" className={styles.recovery}>
        <p className={styles.eyebrow}>Trip configuration</p>
        <h1>Configure</h1>
        <h2>Loading current tour details</h2>
        <Skeleton variant="line" />
        <Skeleton variant="line" />
      </section>
    </PageContainer>
  );
}

function ProductErrorState({
  onRetry,
  tourProductIdentity,
}: {
  onRetry: () => void;
  tourProductIdentity: string;
}) {
  return (
    <PageContainer variant="reading">
      <section className={styles.recovery}>
        <p className={styles.eyebrow}>Trip configuration</p>
        <h1>Configure</h1>
        <h2>We couldn't load the current tour details.</h2>
        <p>
          Your saved choices are still preserved. Retry the public TourProduct read or return to the
          tour detail.
        </p>
        <div className={styles.recoveryActions}>
          <Button onClick={onRetry} variant="secondary">
            Retry tour details
          </Button>
          <TextLink to={routeBuilders.tourDetail(tourProductIdentity)}>
            Back to tour details
          </TextLink>
        </div>
      </section>
    </PageContainer>
  );
}

function pricePresentation(
  product: TourDetailModel,
  draft: ReturnType<typeof useReservationDraft>['draft'],
  isFetching: boolean,
  isError: boolean,
): PriceDisplayModel {
  const current = buildPublicConfigurePrice({
    participantCount: draft.participantCount,
    selectedStyle: draft.tourStyle,
    stylePrices: product.stylePrices,
  });

  if (current.state !== 'known') {
    return current;
  }

  if (isError) {
    return {
      state: 'error',
      previousTotalLabel: current.totalLabel,
      message: 'Could not refresh the current TourProduct price.',
    };
  }

  if (isFetching) {
    return {
      state: 'recalculating',
      previousTotalLabel: current.totalLabel,
    };
  }

  return current;
}

interface ResolvedConfigurePageProps {
  backendTourProductId: ResourceId;
  tourProductIdentity: string;
}

function ResolvedConfigurePage({
  backendTourProductId,
  tourProductIdentity,
}: ResolvedConfigurePageProps) {
  const navigate = useNavigate();
  const { draft, hydrationStatus, persistenceStatus } = useReservationDraft();
  const detailQuery = useTourDetail(tourDetailDataSource, backendTourProductId);
  const scheduleQuery = useTourSchedules(tourScheduleDataSource, backendTourProductId);

  const entryState = getConfigureDraftEntryState({
    draft,
    hydrationStatus,
    routeTourProductId: tourProductIdentity,
  });

  if (entryState.status !== 'ready') {
    const isRouteMismatch = entryState.status === 'route-mismatch';

    return (
      <PageContainer variant="reading">
        <section className={styles.recovery}>
          <p className={styles.eyebrow}>Trip configuration</p>
          <h1>Configure</h1>
          <h2>
            {entryState.status === 'discarded'
              ? 'Saved trip could not be restored'
              : isRouteMismatch
                ? 'This route does not match your saved trip'
                : 'Choose a style and schedule first'}
          </h2>
          <p>
            {entryState.status === 'discarded'
              ? 'The saved transaction data was invalid or incompatible, so it was cleared safely.'
              : isRouteMismatch
                ? 'Your existing transaction belongs to another tour. It has been preserved instead of being replaced by this route.'
                : 'This Configure route does not have a complete local transaction context. Return to the tour detail and choose a style and schedule before configuring the trip.'}
          </p>

          <div className={styles.recoveryActions}>
            {isRouteMismatch ? (
              <>
                <TextLink to={routeBuilders.configure(entryState.savedTourProductId)}>
                  Resume saved trip
                </TextLink>
                <TextLink to={routeBuilders.tourDetail(tourProductIdentity)}>
                  View this tour
                </TextLink>
              </>
            ) : (
              <TextLink to={routeBuilders.tourDetail(tourProductIdentity)}>
                Back to tour details
              </TextLink>
            )}
          </div>
        </section>
      </PageContainer>
    );
  }

  if (detailQuery.data === undefined) {
    if (detailQuery.isError) {
      return (
        <ProductErrorState
          onRetry={() => {
            void detailQuery.refetch();
          }}
          tourProductIdentity={tourProductIdentity}
        />
      );
    }

    return <ProductLoadingState />;
  }

  const product = detailQuery.data;
  const selectedScheduleLabel =
    scheduleQuery.data?.find((schedule) => schedule.selectionKey === draft.tourScheduleId)
      ?.dateLabel ?? 'Selected schedule';

  const baseScenario = createContractNeutralConfigureFixture();
  const scenario = {
    ...baseScenario,
    tripSummary: {
      ...baseScenario.tripSummary,
      themeLabel: product.themeLabel,
      scheduleLabel: selectedScheduleLabel,
    },
  };

  const price = pricePresentation(product, draft, detailQuery.isFetching, detailQuery.isError);
  const styleLabel =
    draft.tourStyle === null
      ? 'Style required'
      : draft.tourStyle.charAt(0) + draft.tourStyle.slice(1).toLowerCase();
  const participantRule = product.theme === 'HONEYMOON_ROMANCE' ? 'honeymoon' : 'general';

  return (
    <PageContainer variant="transaction">
      <div className={styles.page}>
        <header className={styles.tripContext}>
          <div className={styles.contextCopy}>
            <p className={styles.eyebrow}>Trip configuration</p>
            <h1>Configure</h1>
            <h2>Build your trip</h2>
            <p className={styles.contextLine}>
              {product.themeLabel} · {styleLabel} · {selectedScheduleLabel}
            </p>
            <p className={styles.fixtureNote}>
              The current Style price comes from TourProduct. Final discount and total are confirmed
              by Backend when the Reservation is created.
            </p>
          </div>

          <TextLink to={routeBuilders.tourDetail(tourProductIdentity)}>
            Change style/schedule
          </TextLink>
        </header>

        {persistenceStatus === 'degraded' ? (
          <p className={styles.persistenceWarning} role="status">
            Your choices are available in this tab, but browser storage is unavailable. Refresh
            recovery cannot be guaranteed.
          </p>
        ) : null}

        <ConfigureDesktop
          onRetryPrice={() => {
            void detailQuery.refetch();
          }}
          onReturnToTour={() => {
            void navigate(routeBuilders.tourDetail(tourProductIdentity));
          }}
          onReview={() => {
            void navigate(routePaths.reservationReview);
          }}
          participantRule={participantRule}
          price={price}
          scenario={scenario}
          tourProductId={tourProductIdentity}
        />
      </div>
    </PageContainer>
  );
}

export function ConfigurePage() {
  const { tourId } = useParams();
  const backendTourProductId = parseResourceIdRouteParam(tourId);

  if (backendTourProductId === null) {
    return null;
  }

  return (
    <ResolvedConfigurePage
      backendTourProductId={backendTourProductId}
      tourProductIdentity={toCanonicalBackendResourceIdentity(backendTourProductId)}
    />
  );
}
