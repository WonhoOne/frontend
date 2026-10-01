import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { routeBuilders, routePaths } from '@/app/router/paths';
import {
  createConfirmedReservationTransition,
  createReservationIntent,
  createReservationMutationController,
  createReservationReviewModel,
  getReviewDraftHandoffState,
  mockReservationCreateIdentityResolver,
  mockReservationDataSource,
  previewReservationReviewResolver,
  presentReservationReviewValidation,
  useReservationDraft,
  type ReservationMutationState,
} from '@/features/reservation';
import { Button, PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/reservation-review/ReservationReviewPage.module.css';

export function ReservationReviewPage() {
  const { draft, dispatch, hydrationStatus, persistenceStatus } = useReservationDraft();
  const navigate = useNavigate();
  const mutation = useMemo(
    () => createReservationMutationController(mockReservationDataSource),
    [],
  );
  const [mutationState, setMutationState] = useState<ReservationMutationState>(mutation.getState());
  const handoff = getReviewDraftHandoffState({ draft, hydrationStatus });

  async function submitReservation() {
    const intent = createReservationIntent(draft, mockReservationCreateIdentityResolver);
    if (intent.status !== 'ready') return;

    const pending = mutation.submit(intent.input);
    setMutationState(mutation.getState());
    const result = await pending;
    setMutationState(mutation.getState());

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
              <p role="alert" className={styles.warning}>
                We could not confirm whether the reservation was created. Your trip is preserved. Do
                not submit again until the result can be confirmed.
              </p>
            ) : null}
            {mutationState.status === 'failure' ? (
              <p role="alert" className={styles.warning}>
                The reservation could not be submitted. Your trip is preserved so you can review the
                changed information and try again manually.
              </p>
            ) : null}

            <div className={styles.submitBar}>
              <Button type="button" disabled={submitting} onClick={() => void submitReservation()}>
                {submitting ? 'Applying…' : 'Apply for reservation'}
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
