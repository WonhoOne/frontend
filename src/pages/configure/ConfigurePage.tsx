import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { routeBuilders, routePaths } from '@/app/router/paths';
import { ConfigureDesktop, createContractNeutralConfigureFixture } from '@/features/configuration';
import { getConfigureDraftEntryState, useReservationDraft } from '@/features/reservation';
import { PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/configure/ConfigurePage.module.css';

export function ConfigurePage() {
  const navigate = useNavigate();
  const { tourId } = useParams();
  const { draft, hydrationStatus, persistenceStatus } = useReservationDraft();
  const scenario = useMemo(() => createContractNeutralConfigureFixture(), []);

  if (tourId === undefined) {
    return null;
  }

  const entryState = getConfigureDraftEntryState({
    draft,
    hydrationStatus,
    routeTourProductId: tourId,
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
                <TextLink to={routeBuilders.tourDetail(tourId)}>View this tour</TextLink>
              </>
            ) : (
              <TextLink to={routeBuilders.tourDetail(tourId)}>Back to tour details</TextLink>
            )}
          </div>
        </section>
      </PageContainer>
    );
  }

  const styleLabel =
    draft.tourStyle === null
      ? 'Style required'
      : draft.tourStyle.charAt(0) + draft.tourStyle.slice(1).toLowerCase();

  return (
    <PageContainer variant="transaction">
      <div className={styles.page}>
        <header className={styles.tripContext}>
          <div className={styles.contextCopy}>
            <p className={styles.eyebrow}>Trip configuration</p>
            <h1>Configure</h1>
            <h2>Build your trip</h2>
            <p className={styles.contextLine}>
              {scenario.tripSummary.themeLabel} · {styleLabel} ·{' '}
              {scenario.tripSummary.scheduleLabel}
            </p>
            <p className={styles.fixtureNote}>
              Development fixture catalog — canonical option IDs and live prices are not assumed.
            </p>
          </div>

          <TextLink to={routeBuilders.tourDetail(tourId)}>Change style/schedule</TextLink>
        </header>

        {persistenceStatus === 'degraded' ? (
          <p className={styles.persistenceWarning} role="status">
            Your choices are available in this tab, but browser storage is unavailable. Refresh
            recovery cannot be guaranteed.
          </p>
        ) : null}

        <ConfigureDesktop
          onReturnToTour={() => {
            void navigate(routeBuilders.tourDetail(tourId));
          }}
          onReview={() => {
            void navigate(routePaths.reservationReview);
          }}
          participantRule="general"
          scenario={scenario}
          tourProductId={tourId}
        />
      </div>
    </PageContainer>
  );
}
