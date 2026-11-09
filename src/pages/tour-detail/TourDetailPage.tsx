import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import {
  tourDetailDataSource,
  tourScheduleDataSource,
} from '@/app/providers/tourDetailDataSources';
import { routeBuilders, routePaths } from '@/app/router/paths';
import { LoadingState } from '@/app/state';
import {
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

/**
 * Style·일정 선택을 어디에 저장할지 page가 정한다.
 * WHY: 실제 화면은 ReservationDraft에 저장하고(새로고침·Voice와 공유), 테스트/미리보기는
 * selection 없이 component 내부 state로 동작한다.
 */
interface TourDetailSelection {
  style: TourDetailStyle | null;
  scheduleKey: string | null;
  onStyleChange: (style: TourDetailStyle) => void;
  onScheduleChange: (key: string) => void;
}

interface TourDetailPageViewProps {
  coreState: TourDetailCoreState;
  scheduleState?: TourScheduleSectionState;
  onRetry?: () => void;
  onRetrySchedule?: () => void;
  onConfigure?: (intent: ConfigureHandoffIntent) => void;
  selection?: TourDetailSelection;
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

/** 상품을 찾지 못했거나 읽지 못했을 때의 전체 화면 안내. 목록으로 돌아갈 길을 항상 준다. */
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

/**
 * 상품 정보를 받은 뒤의 상세 화면.
 *
 * INVARIANT: 선택한 일정이 지금 응답에서 선택 가능(`isSelectable`)하지 않으면
 * 선택되지 않은 것으로 본다. Backend의 `reservable` 판정을 Frontend가 다시 계산하지 않는다.
 * Configure로 넘기는 값은 상품 id, Style, 일정 id 세 가지뿐이다 (F1 handoff).
 */
function TourDetailReadyView({
  onConfigure,
  onRetrySchedule,
  scheduleState,
  tour,
  selection,
}: {
  tour: TourDetailModel;
  scheduleState?: TourScheduleSectionState;
  onRetrySchedule?: () => void;
  onConfigure?: (intent: ConfigureHandoffIntent) => void;
  selection?: TourDetailSelection;
}) {
  const [localStyle, setSelectedStyle] = useState<TourDetailStyle | null>(null);
  const [localScheduleKey, setSelectedScheduleKey] = useState<string | null>(null);
  const selectedStyle = selection ? selection.style : localStyle;
  const selectedScheduleKey = selection ? selection.scheduleKey : localScheduleKey;
  const resolvedScheduleState: TourScheduleSectionState = scheduleState ?? { status: 'loading' };

  // 일정 목록이 새로 바뀌어 저장된 선택이 더 이상 유효하지 않으면 선택을 비운 것으로 본다.
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
        onChange={selection?.onStyleChange ?? setSelectedStyle}
        selectedStyle={selectedStyle}
      />
      <TourScheduleSection
        onChange={selection?.onScheduleChange ?? setSelectedScheduleKey}
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

/**
 * 상태(loading / not-found / error / ready)에 따라 화면을 고르는 표현 계층.
 * Data fetching이 없어 테스트와 미리보기에서 그대로 쓸 수 있다.
 */
export function TourDetailPageView({
  coreState,
  onConfigure,
  onRetry,
  onRetrySchedule,
  scheduleState,
  selection,
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
      {...(selection === undefined ? {} : { selection })}
    />
  );
}

interface ResolvedTourDetailPageProps {
  detailDataSource: TourDetailDataSource;
  resourceId: number;
  scheduleDataSource: TourScheduleDataSource;
}

/**
 * 유효한 상품 id가 있을 때 상세와 일정을 읽고 선택을 ReservationDraft에 기록한다.
 *
 * WHY: 다른 상품의 Draft가 남아 있으면 그 Style/일정을 이 화면에 보여주지 않는다.
 * 이 상품에서 처음 선택하는 순간 새 Draft를 시작한다(`START_DRAFT`).
 */
function ResolvedTourDetailPage({
  detailDataSource,
  resourceId,
  scheduleDataSource,
}: ResolvedTourDetailPageProps) {
  const navigate = useNavigate();
  const { draft, dispatch } = useReservationDraft();
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
      selection={{
        style: draft.tourProductId === detailQuery.data?.id ? draft.tourStyle : null,
        scheduleKey: draft.tourProductId === detailQuery.data?.id ? draft.tourScheduleId : null,
        onStyleChange: (style) => {
          if (!detailQuery.data) return;
          if (draft.tourProductId !== detailQuery.data.id) {
            dispatch({
              type: 'START_DRAFT',
              tourProductId: detailQuery.data.id,
              updatedAt: Date.now(),
            });
          }
          dispatch({ type: 'SELECT_TOUR_STYLE', tourStyle: style, updatedAt: Date.now() });
        },
        onScheduleChange: (key) => {
          if (!detailQuery.data) return;
          if (draft.tourProductId !== detailQuery.data.id) {
            dispatch({
              type: 'START_DRAFT',
              tourProductId: detailQuery.data.id,
              updatedAt: Date.now(),
            });
          }
          dispatch({ type: 'SELECT_SCHEDULE', tourScheduleId: key, updatedAt: Date.now() });
        },
      }}
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

/**
 * S03 Tour Detail route 진입점. URL의 `tourId`가 canonical 양의 정수가 아니면 요청 없이
 * not-found를 보여준다.
 */
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
