import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { queryClient } from '@/app/providers/queryClient';
import { reservationDataSource } from '@/app/providers/reservationDataSource';
import {
  tourDetailDataSource,
  tourScheduleDataSource,
} from '@/app/providers/tourDetailDataSources';
import { LoadingState, SectionError } from '@/app/state';
import {
  useTourDetail,
  useTourSchedules,
  type TourDetailDataSource,
  type TourScheduleDataSource,
} from '@/features/tour-detail';
import { parseBackendResourceIdentity } from '@/shared/lib/resourceIdentity';
import { routeBuilders, routePaths } from '@/app/router/paths';
import { saveReturnContext } from '@/features/auth';
import {
  canonicalReservationCreateIdentityResolver,
  checkTransportCapacity,
  createConfirmedReservationTransition,
  createReservationIntent,
  createReservationMutationController,
  createReservationReviewModel,
  getReservationNetworkRecovery,
  getReservationSubmitRecovery,
  getReviewDraftHandoffState,
  createReservationReviewSelectionResolver,
  type ReservationReviewSelectionResolver,
  type ReservationDraftV1,
  presentReservationReviewValidation,
  refreshReservationConflictTruth,
  useReservationDraft,
  ReservationDataSourceError,
  type ReservationCorrectionTarget,
  type ReservationDataSource,
  type ReservationMutationState,
} from '@/features/reservation';
import { Button, PageContainer, Skeleton, TextLink } from '@/shared/ui';

import styles from '@/pages/reservation-review/ReservationReviewPage.module.css';

/**
 * 409/422 뒤 최신 상품·일정 정보를 다시 읽는 진행 상태.
 * WHY: 충돌이 났을 때 화면이 옛 cache로 정정 화면을 보여주지 않도록, 정정 링크를
 * 누르기 전에 최신 truth를 받아 둔다. 실패해도 정정 화면이 다시 요청한다.
 */
type ConflictTruthState = 'idle' | 'refreshing' | 'refreshed' | 'failed';

interface ReservationReviewPageProps {
  dataSource?: ReservationDataSource;
  detailDataSource?: TourDetailDataSource;
  scheduleDataSource?: TourScheduleDataSource;
  refreshConflictTruth?: (tourProductIdentity: string) => Promise<boolean>;
}

/** 기본 구현은 앱 공용 QueryClient의 상품·일정 cache를 무효화하고 다시 읽는다. */
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

/**
 * Draft가 가리키는 상품/일정을 확인할 수 없을 때의 복구 화면.
 * INVARIANT: Draft는 지우지 않는다. 다시 읽기(retry)나 상품 목록으로만 안내한다.
 */
function ReviewIdentityRecovery({
  onRetry,
  isRetrying = false,
}: {
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  return (
    <PageContainer variant="transaction">
      <div className={styles.page}>
        <h1>Reservation Review</h1>
        {onRetry ? (
          <SectionError
            title="We couldn't load your selected trip."
            retryLabel="Try again"
            retryingLabel="Trying again"
            isRetrying={isRetrying}
            onRetry={onRetry}
          >
            <p>
              Your draft is preserved. Reload the product and schedule information before reviewing.
            </p>
          </SectionError>
        ) : (
          <p>Your selected trip could not be verified. Your draft is preserved.</p>
        )}
        <TextLink to={routePaths.tours}>Browse tours</TextLink>
      </div>
    </PageContainer>
  );
}

/**
 * Review에 보여줄 실제 상품명·일정을 Backend에서 읽어 Draft와 맞춘다.
 *
 * CONTRACT: Draft에는 id만 있다. 화면에는 raw id나 임시 문구 대신 Backend가 준
 * `TourProduct.name`과 일정 날짜를 보여준다 (B9-D #42). 둘 중 하나라도 읽지 못하거나
 * Draft의 선택이 응답에 없으면 Review를 그리지 않고 복구 화면을 보여준다.
 */
function ReservationReviewSelection({
  resourceId,
  draft,
  detailDataSource,
  scheduleDataSource,
  children,
}: {
  resourceId: number;
  draft: ReservationDraftV1;
  detailDataSource: TourDetailDataSource;
  scheduleDataSource: TourScheduleDataSource;
  children: (resolver: ReservationReviewSelectionResolver) => ReactNode;
}) {
  const detail = useTourDetail(detailDataSource, resourceId);
  const schedules = useTourSchedules(scheduleDataSource, resourceId);
  const resolver =
    detail.data !== undefined && schedules.data !== undefined
      ? createReservationReviewSelectionResolver(draft, detail.data, schedules.data)
      : null;

  if (resolver !== null) return children(resolver);
  if (
    detail.isError ||
    schedules.isError ||
    (detail.data !== undefined && schedules.data !== undefined)
  ) {
    return (
      <ReviewIdentityRecovery
        isRetrying={detail.isFetching || schedules.isFetching}
        onRetry={() => {
          void detail.refetch();
          void schedules.refetch();
        }}
      />
    );
  }
  return (
    <PageContainer variant="transaction">
      <div className={styles.page}>
        <h1>Reservation Review</h1>
        <LoadingState label="Loading your selected trip">
          <Skeleton style={{ height: '12rem' }} />
          <Skeleton style={{ height: '12rem' }} />
        </LoadingState>
      </div>
    </PageContainer>
  );
}

/**
 * S05 Reservation Review — 예약을 실제로 제출하는 유일한 화면.
 *
 * CONTRACT:
 * - 제출은 사용자가 버튼을 눌렀을 때만 일어난다. Voice나 로그인 복귀는 자동 제출하지
 *   않는다 (FR-13, Master Plan §17).
 * - 제출은 비관적이다. Backend가 성공을 확정해야 Success로 이동하고 Draft를 비운다.
 * - 결과를 알 수 없으면(응답 유실) 중복 예약을 막기 위해 다시 제출을 잠근다.
 * - 409/422는 Draft를 자동으로 고치지 않는다. 사용자가 원래 단계에서 직접 고친다.
 *
 * DataSource들은 테스트에서 주입할 수 있게 prop으로 받고, 기본값은 app composition이다.
 */
export function ReservationReviewPage({
  dataSource = reservationDataSource,
  detailDataSource = tourDetailDataSource,
  scheduleDataSource = tourScheduleDataSource,
  refreshConflictTruth = defaultRefreshConflictTruth,
}: ReservationReviewPageProps = {}) {
  const { draft, dispatch, hydrationStatus, persistenceStatus } = useReservationDraft();
  const navigate = useNavigate();
  const mutation = useMemo(() => createReservationMutationController(dataSource), [dataSource]);
  const [mutationState, setMutationState] = useState<ReservationMutationState>(mutation.getState());
  const [conflictTruthState, setConflictTruthState] = useState<ConflictTruthState>('idle');
  const handoff = getReviewDraftHandoffState({ draft, hydrationStatus });
  // WHY: 복원된 Draft나 Voice로 바뀐 Draft도 Review에 들어올 수 있다. BR-20(차량 정원 ≥ 인원)을
  // 넘으면 Backend가 422로 거절할 요청이므로 보내기 전에 막고 Configure 정정으로 안내한다 (frontend#66).
  const transportCapacityExceeded =
    checkTransportCapacity({
      participantCount: draft.participantCount,
      transportSelectionKey: draft.configuration.transportSelectionKey,
    }).status === 'exceeded';

  /**
   * 제출 흐름:
   * 1. Draft → 제출 입력 (완성되지 않았으면 아무것도 하지 않음)
   * 2. 오프라인이면 요청을 보내지 않고 "보내지 않음" 실패로 표시
   * 3. 401 → ReturnContext 저장 후 로그인 (돌아와도 자동 제출 없음)
   * 4. 충돌/검증 실패 → 최신 truth를 다시 읽어 정정 안내
   * 5. 확정 성공 → Draft 정리 action 후 Success로 이동
   */
  async function submitReservation() {
    const intent = createReservationIntent(draft, canonicalReservationCreateIdentityResolver);
    if (intent.status !== 'ready' || transportCapacityExceeded) return;

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

    // INVARIANT: Draft는 Backend가 성공을 확정한 경우에만 비운다 (ReservationDraft clear 규칙).
    const transition = createConfirmedReservationTransition(result, Date.now());
    if (transition !== null) {
      dispatch(transition.draftAction);
      void navigate(routeBuilders.reservationSuccess(String(transition.reservationId)));
    }
  }

  function renderReview(resolver: ReservationReviewSelectionResolver) {
    const review = createReservationReviewModel(draft, resolver);
    if (review !== null) {
      const validation = presentReservationReviewValidation(
        transportCapacityExceeded
          ? { status: 'blocking', reason: 'transport-capacity-invalid' }
          : { status: 'valid' },
      );
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
      // WHY: 결과를 모르는 요청, 권한 거부, 정정이 필요한 실패에서는 같은 내용을 다시
      // 보내도 의미가 없거나 중복 예약 위험이 있으므로 제출 버튼을 잠근다.
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
              {validation.correctionTarget === 'configure' ? (
                <TextLink to={routeBuilders.configure(review.tourProductId)}>
                  Correct configuration
                </TextLink>
              ) : null}
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
                      <li
                        data-error-code={issue.code}
                        key={`${issue.target}-${issue.code}-${index}`}
                      >
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
                The reservation could not be submitted. Your trip is preserved so you can review the
                information and try again manually.
              </p>
            ) : null}

            <div className={styles.submitBar}>
              <Button
                type="button"
                disabled={submitting || retryBlocked || transportCapacityExceeded}
                onClick={() => void submitReservation()}
              >
                {submitting
                  ? 'Applying…'
                  : mutationState.status === 'uncertain'
                    ? 'Submission locked'
                    : retryBlocked
                      ? 'Correct before resubmitting'
                      : transportCapacityExceeded
                        ? 'Correct before applying'
                        : 'Apply for reservation'}
              </Button>
            </div>
          </div>
        </PageContainer>
      );
    }
    return null;
  }

  // Draft 복원이 끝나고 Review에 들어올 만큼 완성된 경우에만 실제 데이터를 읽는다.
  // 그 외(복원 실패, 미완성, Draft 없음)는 아래 복구 안내를 보여준다.
  if (handoff.status === 'ready') {
    const resourceId = parseBackendResourceIdentity(draft.tourProductId ?? undefined);
    if (resourceId === null) return <ReviewIdentityRecovery />;
    return (
      <ReservationReviewSelection
        resourceId={resourceId}
        draft={draft}
        detailDataSource={detailDataSource}
        scheduleDataSource={scheduleDataSource}
      >
        {renderReview}
      </ReservationReviewSelection>
    );
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
