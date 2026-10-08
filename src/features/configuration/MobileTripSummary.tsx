import { useState } from 'react';
import { createPortal } from 'react-dom';

import type { ConfigureReadiness } from '@/features/configuration/configureReadiness';
import type {
  ConfigurationCategory,
  TripSummaryModel,
} from '@/features/configuration/configurationModels';
import { PriceSummary } from '@/features/configuration/PriceSummary';
import { getCompactPriceLabel } from '@/features/configuration/pricePresentation';
import { BottomSheet, Button } from '@/shared/ui';

import styles from '@/features/configuration/MobileTripSummary.module.css';

interface MobileTripSummaryProps {
  summary: TripSummaryModel;
  readiness: ConfigureReadiness;
  onReview: () => void;
  onRetryPrice?: () => void;
}

function selectionCount(summary: TripSummaryModel) {
  const requiredSelections = [
    summary.selections.hotelLabel,
    summary.selections.transportLabel,
    summary.selections.mealLabel,
  ].filter((value) => value !== null).length;

  return requiredSelections + summary.selections.extraLabels.length;
}

function SummaryRow({
  invalid,
  label,
  value,
}: {
  invalid?: boolean;
  label: string;
  value: string | null;
}) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>
        <span>{value ?? 'Not selected'}</span>
        {invalid ? <span className={styles.warning}>Needs another selection</span> : null}
      </dd>
    </div>
  );
}

function hasInvalidSelection(summary: TripSummaryModel, category: ConfigurationCategory) {
  return summary.invalidSelections.includes(category);
}

/**
 * Mobile Configure의 persistent transaction summary.
 *
 * INVARIANT:
 * - 선택/가격 truth를 자체 계산하지 않고 TripSummaryModel만 표현한다.
 * - BottomSheet open state는 ephemeral UI state이며 ReservationDraft에 저장하지 않는다.
 * - Review 가능 여부는 Desktop과 동일한 ConfigureReadiness를 사용한다.
 */
export function MobileTripSummary({
  summary,
  readiness,
  onReview,
  onRetryPrice,
}: MobileTripSummaryProps) {
  const [isSummaryOpen, setSummaryOpen] = useState(false);
  const count = selectionCount(summary);

  const summaryBar = (
    <aside aria-label="Mobile trip summary" className={styles.bar}>
      <button
        aria-expanded={isSummaryOpen}
        aria-haspopup="dialog"
        aria-label="Open trip summary"
        className={styles.summaryTrigger}
        onClick={() => setSummaryOpen(true)}
        type="button"
      >
        <span className={styles.primaryLine}>
          {summary.styleLabel} · {count} {count === 1 ? 'selection' : 'selections'}
        </span>
        <span className={styles.secondaryLine}>{getCompactPriceLabel(summary.price)}</span>
      </button>

      <Button
        className={styles.reviewButton}
        disabled={!readiness.isReady}
        onClick={onReview}
        size="large"
      >
        Review
      </Button>
    </aside>
  );

  return (
    <>
      {createPortal(summaryBar, document.body)}

      <BottomSheet
        closeLabel="Close summary"
        description="Review your current trip configuration without leaving this page."
        onOpenChange={setSummaryOpen}
        open={isSummaryOpen}
        title="Trip summary"
      >
        <div className={styles.sheetContent}>
          <header className={styles.sheetHeader}>
            <p className={styles.theme}>{summary.themeLabel}</p>
            <p>
              {summary.styleLabel} · {summary.scheduleLabel}
            </p>
          </header>

          <dl className={styles.list}>
            <SummaryRow label="Participants" value={summary.participantLabel} />
            <SummaryRow
              invalid={hasInvalidSelection(summary, 'hotel')}
              label="Hotel"
              value={summary.selections.hotelLabel}
            />
            <SummaryRow
              invalid={hasInvalidSelection(summary, 'transport')}
              label="Transport"
              value={summary.selections.transportLabel}
            />
            <SummaryRow
              invalid={hasInvalidSelection(summary, 'meal')}
              label="Meal"
              value={summary.selections.mealLabel}
            />
            <SummaryRow
              invalid={hasInvalidSelection(summary, 'extras')}
              label="Extras"
              value={
                summary.selections.extraLabels.length === 0
                  ? null
                  : summary.selections.extraLabels.join(', ')
              }
            />
          </dl>

          <PriceSummary
            {...(onRetryPrice === undefined ? {} : { onRetry: onRetryPrice })}
            price={summary.price}
          />

          <Button
            className={styles.sheetReviewButton}
            disabled={!readiness.isReady}
            onClick={onReview}
            size="large"
          >
            Review trip
          </Button>

          {!readiness.isReady ? (
            <p className={styles.requirements}>
              {readiness.issues.includes('extras')
                ? 'Remove an unavailable Extra before continuing.'
                : 'Complete the participant count, Hotel, Transport, and Meal to continue.'}
            </p>
          ) : null}
        </div>
      </BottomSheet>
    </>
  );
}
