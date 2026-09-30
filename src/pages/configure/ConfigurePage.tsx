import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { routeBuilders, routePaths } from '@/app/router/paths';
import { ConfigureDesktop, createContractNeutralConfigureFixture } from '@/features/configuration';
import { useReservationDraft } from '@/features/reservation';
import { PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/configure/ConfigurePage.module.css';

export function ConfigurePage() {
  const navigate = useNavigate();
  const { tourId } = useParams();
  const { draft } = useReservationDraft();
  const scenario = useMemo(() => createContractNeutralConfigureFixture(), []);

  if (tourId === undefined) {
    return null;
  }

  if (draft.tourProductId !== tourId || draft.tourStyle === null || draft.tourScheduleId === null) {
    return (
      <PageContainer variant="reading">
        <section className={styles.recovery}>
          <p className={styles.eyebrow}>Trip configuration</p>
          <h1>Configure</h1>
          <h2>Choose a style and schedule first</h2>
          <p>
            This Configure route does not have a complete local transaction context. Return to the
            tour detail and choose a style and schedule before configuring the trip.
          </p>
          <TextLink to={routeBuilders.tourDetail(tourId)}>Back to tour details</TextLink>
        </section>
      </PageContainer>
    );
  }

  const styleLabel = draft.tourStyle.charAt(0) + draft.tourStyle.slice(1).toLowerCase();

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

        <ConfigureDesktop
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
