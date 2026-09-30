import { routeBuilders, routePaths } from '@/app/router/paths';
import { getReviewDraftHandoffState, useReservationDraft } from '@/features/reservation';
import { PageContainer, TextLink } from '@/shared/ui';

import styles from '@/pages/reservation-review/ReservationReviewPage.module.css';

/**
 * PR-05/C9가 소유하는 Review route handoff guard.
 *
 * LIFECYCLE:
 * - Draft가 있으면 Configure로 안전하게 돌아갈 수 있는 경로만 제공한다.
 * - Draft가 없거나 복원에 실패하면 calm recovery를 제공한다.
 * - 실제 Review summary/validation/submit은 PR-06(IMP-4) 소유이며 여기서 구현하지 않는다.
 */
export function ReservationReviewPage() {
  const { draft, hydrationStatus, persistenceStatus } = useReservationDraft();
  const handoff = getReviewDraftHandoffState({
    draft,
    hydrationStatus,
  });

  if (handoff.status === 'ready') {
    return (
      <PageContainer variant="reading">
        <section className={styles.surface}>
          <p className={styles.eyebrow}>Transaction handoff</p>
          <h1>Reservation Review</h1>
          <h2>Your trip draft is preserved</h2>
          <p>
            Your current configuration is still available in this tab. The full review and
            reservation submission experience is implemented in the next reservation stage.
          </p>
          {persistenceStatus === 'degraded' ? (
            <p className={styles.warning} role="status">
              This draft is available now, but browser storage is unavailable. Refresh recovery
              cannot be guaranteed.
            </p>
          ) : null}
          <TextLink to={routeBuilders.configure(handoff.tourProductId)}>
            Back to configuration
          </TextLink>
        </section>
      </PageContainer>
    );
  }

  const configureRecoveryTarget =
    handoff.status === 'incomplete' && handoff.tourProductId !== null
      ? routeBuilders.configure(handoff.tourProductId)
      : null;

  return (
    <PageContainer variant="reading">
      <section className={styles.surface}>
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
