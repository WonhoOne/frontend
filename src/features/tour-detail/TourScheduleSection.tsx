import { Button, OptionCard, PageContainer, Skeleton } from '@/shared/ui';

import type {
  ScheduleChoiceModel,
  TourScheduleErrorReason,
  TourScheduleSectionState,
} from '@/features/tour-detail/tourDetail.model';

import styles from '@/features/tour-detail/TourScheduleSection.module.css';

interface TourScheduleSectionProps {
  scheduleState: TourScheduleSectionState;
  selectedScheduleKey: number | null;
  onChange: (selectionKey: number) => void;
  onRetry?: () => void;
}

const errorCopy: Record<TourScheduleErrorReason, { title: string; message: string }> = {
  network: {
    title: "We couldn't load schedules.",
    message: 'Check your connection and try the schedule section again.',
  },
  server: {
    title: "We couldn't load schedules.",
    message: 'Please try the schedule section again shortly.',
  },
  'data-mismatch': {
    title: "We couldn't prepare these schedules.",
    message: 'The schedule data could not be displayed safely.',
  },
};

function ScheduleSkeleton() {
  return (
    <div className={styles.skeletonGrid} data-testid="tour-schedule-skeleton">
      {[0, 1].map((item) => (
        <div className={styles.skeletonCard} key={item}>
          <Skeleton className={styles.skeletonDate ?? ''} variant="line" />
          <Skeleton className={styles.skeletonStatus ?? ''} variant="line" />
          <Skeleton className={styles.skeletonRecruitment ?? ''} variant="line" />
        </div>
      ))}
    </div>
  );
}

function ScheduleChoice({
  choice,
  isSelected,
  onChange,
}: {
  choice: ScheduleChoiceModel;
  isSelected: boolean;
  onChange: (selectionKey: number) => void;
}) {
  const inputId = `tour-schedule-${choice.selectionKey}`;

  return (
    <OptionCard
      className={styles.option ?? ''}
      isDisabled={!choice.isSelectable}
      isSelected={isSelected}
    >
      <label className={styles.label} htmlFor={inputId}>
        <span className={styles.topLine}>
          <span className={styles.date}>{choice.dateLabel}</span>
          <input
            checked={isSelected}
            disabled={!choice.isSelectable}
            id={inputId}
            name="tour-schedule"
            onChange={() => onChange(choice.selectionKey)}
            type="radio"
            value={choice.selectionKey}
          />
        </span>
        <span className={styles.status}>{choice.statusLabel}</span>
        <span className={styles.recruitment}>{choice.recruitmentSummary}</span>
      </label>
    </OptionCard>
  );
}

export function TourScheduleSection({
  onChange,
  onRetry,
  scheduleState,
  selectedScheduleKey,
}: TourScheduleSectionProps) {
  return (
    <section aria-labelledby="tour-schedule-title" className={styles.root}>
      <PageContainer variant="wide">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Choose a schedule</p>
          <h2 id="tour-schedule-title">Pick a departure when schedule truth is available.</h2>
          <p>
            Availability and recruitment are shown as provided for each schedule. This screen does
            not calculate confirmation from raw participant counts.
          </p>
        </div>

        {scheduleState.status === 'loading' ? (
          <section aria-busy="true" aria-label="Loading tour schedules" className={styles.loading}>
            <span className={styles.visuallyHidden}>Loading tour schedules</span>
            <ScheduleSkeleton />
          </section>
        ) : null}

        {scheduleState.status === 'empty' ? (
          <div className={styles.statePanel}>
            <div>
              <h3>No schedules are available yet.</h3>
              <p>There are currently no schedule choices to display for this TourProduct.</p>
            </div>
            {onRetry !== undefined ? (
              <Button onClick={onRetry} variant="secondary">
                Retry schedules
              </Button>
            ) : null}
          </div>
        ) : null}

        {scheduleState.status === 'error' ? (
          <div aria-live="polite" className={styles.statePanel}>
            <div>
              <h3>{errorCopy[scheduleState.reason].title}</h3>
              <p>{errorCopy[scheduleState.reason].message}</p>
            </div>
            {onRetry !== undefined ? (
              <Button
                isLoading={scheduleState.isRetrying ?? false}
                loadingLabel="Retrying schedules"
                onClick={onRetry}
                variant="secondary"
              >
                Retry schedules
              </Button>
            ) : null}
          </div>
        ) : null}

        {scheduleState.status === 'ready' ? (
          <div className={styles.ready}>
            {scheduleState.freshness === 'refreshing' ? (
              <p className={styles.refreshIndicator} role="status">
                <span aria-hidden="true" className={styles.refreshDot} />
                Updating schedules
              </p>
            ) : null}
            {scheduleState.freshness === 'stale' ? (
              <p className={styles.refreshIndicator} role="status">
                <span aria-hidden="true" className={styles.refreshDot} />
                Showing saved schedules while refresh is unavailable
              </p>
            ) : null}

            {scheduleState.hasPartialError === true ? (
              <div aria-live="polite" className={styles.partialError}>
                <div>
                  <h3>Some schedule information is unavailable.</h3>
                  <p>The available schedule choices remain usable.</p>
                </div>
                {onRetry !== undefined ? (
                  <Button onClick={onRetry} variant="secondary">
                    Retry schedule data
                  </Button>
                ) : null}
              </div>
            ) : null}

            <fieldset className={styles.fieldset}>
              <legend className={styles.visuallyHidden}>Tour schedule options</legend>
              <div className={styles.grid}>
                {scheduleState.choices.map((choice) => (
                  <ScheduleChoice
                    choice={choice}
                    isSelected={selectedScheduleKey === choice.selectionKey}
                    key={choice.selectionKey}
                    onChange={onChange}
                  />
                ))}
              </div>
            </fieldset>

            {scheduleState.choices.every((choice) => !choice.isSelectable) ? (
              <p className={styles.unavailableNote} role="status">
                No schedule is currently selectable.
              </p>
            ) : (
              <p className={styles.help}>
                No schedule is selected for you. Choose an available option when you are ready.
              </p>
            )}
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
}
