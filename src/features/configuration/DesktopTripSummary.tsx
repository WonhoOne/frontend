import type { ConfigureReadiness } from '@/features/configuration/configureReadiness';
import type {
  ConfigurationCategory,
  TripSummaryModel,
} from '@/features/configuration/configurationModels';
import { PriceSummary } from '@/features/configuration/PriceSummary';
import { Button } from '@/shared/ui';

import styles from '@/features/configuration/DesktopTripSummary.module.css';

interface DesktopTripSummaryProps {
  summary: TripSummaryModel;
  readiness: ConfigureReadiness;
  onReview: () => void;
  onRetryPrice?: () => void;
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

export function DesktopTripSummary({
  summary,
  readiness,
  onReview,
  onRetryPrice,
}: DesktopTripSummaryProps) {
  return (
    <aside aria-label="Current trip configuration" className={styles.summary}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Trip summary</p>
        <h2>{summary.themeLabel}</h2>
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

      <div className={styles.action}>
        <Button
          className={styles.reviewButton}
          disabled={!readiness.isReady}
          onClick={onReview}
          size="large"
        >
          Review trip
        </Button>
        {!readiness.isReady ? (
          <p className={styles.requirements}>
            Complete the trip context, participant count, Hotel, Transport, and Meal to continue.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
