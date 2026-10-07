import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { queryClient } from '@/app/providers/queryClient';
import { reservationDataSource } from '@/app/providers/reservationDataSource';
import { routeBuilders, routePaths } from '@/app/router/paths';
import { saveReturnContext } from '@/features/auth';
import {
  canonicalReservationCreateIdentityResolver,
  createConfirmedReservationTransition,
  createReservationIntent,
  createReservationMutationController,
  createReservationReviewModel,
  getReservationNetworkRecovery,
  getReservationSubmitRecovery,
  getReviewDraftHandoffState,
  previewReservationReviewResolver,
  presentReservationReviewValidation,
  refreshReservationConflictTruth,
  useReservationDraft,
  ReservationDataSourceError,
  type ReservationCorrectionTarget,
  type ReservationDataSource,
  type ReservationMutationState,
} from '@/features/reservation';
import { Button, PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/reservation-review/ReservationReviewPage.module.css';

type ConflictTruthState = 'idle' | 'refreshing' | 'refreshed' | 'failed';

interface ReservationReviewPageProps {
  dataSource?: ReservationDataSource;
  refreshConflictTruth?: (tourProductIdentity: string) => Promise<boolean>;
}

function defaultRefreshConflictTruth(tourProductIdentity: string) {
  return refreshReservationConflictTruth(queryClient, tourProductIdentity);
}

function correctionTargetLabel(target: ReservationCorrectionTarget) {
  const labels: Record<ReservationCorrectionTarget, string> = {
    schedule: 'Schedule',
    'participant-count': 'Traveller count',
    hotel: 'Hotel',
    transport: 'Transport',
    meal: 'Meal',
    extras: 'Extras',
    configuration: 'Configuration',
  };

  return labels[target];
}

export function ReservationReviewPage({
  dataSource = reservationDataSource,
  refreshConflictTruth = defaultRefreshConflictTruth,
}: ReservationReviewPageProps = {}) {
  const { draft, dispatch, hydrationStatus, persistenceStatus } = useReservationDraft();
  const navigate = useNavigate();
  const mutation = useMemo(() => createReservationMutationController(dataSource), [dataSource]);
  const [mutationState, setMutationState] = useState<ReservationMutationState>(mutation.getState());
  const [conflictTruthState, setConflictTruthState] = useState<ConflictTruthState>('idle');
  const handoff = getReviewDraftHandoffState({ draft, hydrationStatus });

  async function submitReservation() {
    const intent = createReservationIntent(draft, canonicalReservationCreateIdentityResolver);
    if (intent.status !== 'ready') return;

    setConflictTruthState('idle');

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setMutationState({
        status: 'failure',
        error: new ReservationDataSourceError({
          kind: 'network',
          requestMayHaveReachedServer: false,
        }),
      });
      return;
    }

    const pending = mutation.submit(intent.input);
    setMutationState(mutation.getState());
    const result = await pending;
    setMutationState(mutation.getState());

    if (result.status === 'auth-interruption') {
      saveReturnContext({
        createdAt: Date.now(),
        intent: 'resume-reservation-review',
        returnTo: routePaths.reservationReview,
      });
      void navigate(routePaths.login);
      return;
    }

    if (result.status === 'failure') {
      const recovery = getReservationSubmitRecovery(result.error);
      if (recovery?.requiresFreshTruth === true) {
        setConflictTruthState('refreshing');
        const tourProductIdentity = draft.tourProductId;
        if (tourProductIdentity === null) {
          setConflictTruthState('failed');
        } else {
          try {
            const refreshed = await refreshConflictTruth(tourProductIdentity);
            setConflictTruthState(refreshed ? 'refreshed' : 'failed');
          } catch {
            setConflictTruthState('failed');
          }
        }
      }
    }

    const transition = createConfirmedReservationTransition(result, Date.now());
    if (transition !== null) {
      dispatch(transition.draftAction);
      void navigate(routeBuilders.reservationSuccess(String(transition.reservationId)));
    }
  }

  if (handoff.status === 'ready') {
    const review = createReservationReviewModel(draft, previewReservationReviewResolver);
    if (review !== null) {
      const validation = presentReservationReviewValidation({ status: 'valid' });
      const submitting = mutationState.status === 'submitting';
      const submitRecovery =
        mutationState.status === 'failure'
          ? getReservationSubmitRecovery(mutationState.error)
          : null;
      const failureDetail =
        mutationState.status === 'failure' &&
        mutationState.error instanceof ReservationDataSourceError
          ? mutationState.error.detail
          : null;
      const networkRecovery =
        mutationState.status === 'failure'
          ? getReservationNetworkRecovery({
              status: 'failure',
              error: mutationState.error,
            })
          : mutationState.status === 'uncertain'
            ? getReservationNetworkRecovery({
                status: 'uncertain',
                error: mutationState.error,
              })
            : null;
      const retryBlocked =
        networkRecovery?.retryPolicy === 'blocked-until-resolved' ||
        failureDetail?.kind === 'forbidden' ||
        submitRecovery !== null;
      const correctionRoute =
        submitRecovery?.kind === 'schedule-conflict'
          ? routeBuilders.tourDetail(review.tourProductId)
          : submitRecovery === null
            ? null
            : routeBuilders.configure(review.tourProductId);

      return (
        <PageContainer variant="transaction">
          <div className={styles.page}>
            <header className={styles.heading}>
              <p className={styles.eyebrow}>Reservation review</p>
              <h1>Review your trip</h1>
              <p>Check the choices below before applying. Changes happen in the original step.</p>
            </header>

            {persistenceStatus === 'degraded' ? (
              <p className={styles.warning} role="status">
                This draft is available now, but browser storage is unavailable. Refresh recovery
                cannot be guaranteed.
              </p>
            ) : null}

            <section className={styles.section} aria-labelledby="review-trip">
              <div className={styles.sectionHeading}>
                <h2 id="review-trip">Trip</h2>
                <TextLink to={routeBuilders.tourDetail(review.tourProductId)}>
                  Change style or schedule
                </TextLink>
              </div>
              <dl className={styles.summary}>
                <div>
                  <dt>Journey</dt>
                  <dd>{review.tourProductLabel}</dd>
                </div>
                <div>
                  <dt>Style</dt>
                  <dd>{review.styleLabel}</dd>
                </div>
                <div>
                  <dt>Schedule</dt>
                  <dd>{review.scheduleLabel}</dd>
                </div>
                <div>
                  <dt>Travellers</dt>
                  <dd>{review.participantLabel}</dd>
                </div>
              </dl>
            </section>

            <section className={styles.section} aria-labelledby="review-configuration">
              <div className={styles.sectionHeading}>
                <h2 id="review-configuration">Configuration</h2>
                <TextLink to={routeBuilders.configure(review.tourProductId)}>
                  Change configuration
                </TextLink>
              </div>
              <dl className={styles.summary}>
                <div>
                  <dt>Hotel</dt>
                  <dd>{review.hotelLabel}</dd>
                </div>
                <div>
                  <dt>Transport</dt>
                  <dd>{review.transportLabel}</dd>
                </div>
                <div>
                  <dt>Meal</dt>
                  <dd>{review.mealLabel}</dd>
                </div>
                <div>
                  <dt>Extras</dt>
                  <dd>{review.extraLabels.length > 0 ? review.extraLabels.join(', ') : 'None'}</dd>
                </div>
              </dl>
            </section>

            <section className={styles.section} aria-labelledby="review-price">
              <h2 id="review-price">Price</h2>
              <p className={styles.priceNote}>{review.price.message}</p>
            </section>
            <section
              className={styles.validation}
              aria-labelledby="review-validation"
              aria-live="polite"
              data-tone={validation.tone}
            >
              <h2 id="review-validation">{validation.title}</h2>
              <p>{validation.message}</p>
            </section>

            {mutationState.status === 'auth-interruption' ? (
              <p role="alert" className={styles.warning}>
                Sign in is required before applying. Your trip is preserved; sign in and submit
                again manually.
              </p>
            ) : null}
            {mutationState.status === 'uncertain' ? (
              <section role="alert" className={styles.warning}>
                <strong>Reservation result is uncertain.</strong>
                <p>
                  The request may already have reached the server. Your trip is preserved, and
                  another submission is blocked to avoid creating a duplicate reservation.
                </p>
              </section>
            ) : null}
            {failureDetail?.kind === 'forbidden' ? (
              <section role="alert" className={styles.warning}>
                <strong>This account cannot submit this reservation.</strong>
                <p>
                  Your trip is preserved. Signing in again will not change this permission result,
                  so the app will not redirect you to Login.
                </p>
              </section>
            ) : null}
            {submitRecovery !== null ? (
              <section role="alert" className={styles.warning}>
                <strong>
                  {submitRecovery.kind === 'schedule-conflict'
                    ? 'The selected schedule is no longer reservable.'
                    : submitRecovery.kind === 'conflict'
                      ? 'The latest trip availability conflicts with this draft.'
                      : 'Some reservation details need correction.'}
                </strong>
                <p>
                  Your draft was not changed automatically. Review the latest information, correct
                  it yourself, then return here and confirm again.
                </p>
                {'issues' in submitRecovery && submitRecovery.issues.length > 0 ? (
                  <ul className={styles.recoveryList} aria-label="Reservation corrections">
                    {submitRecovery.issues.map((issue, index) => (
                      <li data-error-code={issue.code} key={`${issue.target}-${issue.code}-${index}`}>
                        {correctionTargetLabel(issue.target)} needs attention.
                      </li>
                    ))}
                  </ul>
                ) : null}
                {submitRecovery.requiresFreshTruth ? (
                  <p role="status">
                    {conflictTruthState === 'refreshing'
                      ? 'Refreshing the latest product and schedule information…'
                      : conflictTruthState === 'refreshed'
                        ? 'Latest product and schedule information refreshed.'
                        : conflictTruthState === 'failed'
                          ? 'Latest information could not be refreshed here. The correction screen will request it again.'
                          : 'Latest product and schedule information will be refreshed before correction.'}
                  </p>
                ) : null}
                {correctionRoute !== null ? (
                  <TextLink to={correctionRoute}>
                    {submitRecovery.kind === 'schedule-conflict'
                      ? 'Choose another schedule'
                      : 'Correct configuration'}
                  </TextLink>
                ) : null}
              </section>
            ) : null}
            {networkRecovery?.kind === 'network-failure' ? (
              <p role="alert" className={styles.warning}>
                The reservation was not sent because the network is unavailable. Your trip is
                preserved. Reconnect, then submit again manually.
              </p>
            ) : null}
            {networkRecovery?.kind === 'server-failure' ? (
              <p role="alert" className={styles.warning}>
                The server could not complete the reservation. Your trip is preserved. You can
                submit again manually.
              </p>
            ) : null}
            {mutationState.status === 'failure' &&
            failureDetail === null &&
            submitRecovery === null ? (
              <p role="alert" className={styles.warning}>
                The reservation could not be submitted. Your trip is preserved so you can review
                the information and try again manually.
              </p>
            ) : null}

            <div className={styles.submitBar}>
              <Button
                type="button"
                disabled={submitting || retryBlocked}
                onClick={() => void submitReservation()}
              >
                {submitting
                  ? 'Applying…'
                  : mutationState.status === 'uncertain'
                    ? 'Submission locked'
                    : retryBlocked
                      ? 'Correct before resubmitting'
                      : 'Apply for reservation'}
              </Button>
            </div>
          </div>
        </PageContainer>
      );
    }
  }

  const configureRecoveryTarget =
    handoff.status === 'incomplete' && handoff.tourProductId !== null
      ? routeBuilders.configure(handoff.tourProductId)
      : null;
  return (
    <PageContainer variant="reading">
      <section className={styles.recovery}>
        <p className={styles.eyebrow}>Transaction recovery</p>
        <h1>Reservation Review</h1>
        <h2>
          {handoff.status === 'discarded'
            ? 'Saved trip could not be restored'
            : handoff.status === 'incomplete'
              ? 'Finish configuring your trip'
              : 'No trip to review'}
        </h2>
        <p>
          {handoff.status === 'discarded'
            ? 'The saved transaction data was invalid or incompatible, so it was cleared safely.'
            : handoff.status === 'incomplete'
              ? 'The current draft is not complete enough to enter Review yet.'
              : 'Start from a tour and complete the required configuration before opening Review.'}
        </p>
        {configureRecoveryTarget !== null ? (
          <TextLink to={configureRecoveryTarget}>Back to configuration</TextLink>
        ) : (
          <TextLink to={routePaths.tours}>Browse tours</TextLink>
        )}
      </section>
    </PageContainer>
  );
}
