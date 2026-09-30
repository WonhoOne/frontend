import type { ConfigureReadiness } from '@/features/configuration/configureReadiness';
import type { TripSummaryModel } from '@/features/configuration/configurationModels';
import { Button } from '@/shared/ui';

import styles from '@/features/configuration/DesktopTripSummary.module.css';

interface DesktopTripSummaryProps {
  summary: TripSummaryModel;
  readiness: ConfigureReadiness;
  onReview: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value ?? 'Not selected'}</dd>
    </div>
  );
}

export function DesktopTripSummary({ summary, readiness, onReview }: DesktopTripSummaryProps) {
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
        <SummaryRow label="Hotel" value={summary.selections.hotelLabel} />
        <SummaryRow label="Transport" value={summary.selections.transportLabel} />
        <SummaryRow label="Meal" value={summary.selections.mealLabel} />
        <SummaryRow
          label="Extras"
          value={
            summary.selections.extraLabels.length === 0
              ? null
              : summary.selections.extraLabels.join(', ')
          }
        />
      </dl>

      <div className={styles.price}>
        <span>Price</span>
        {summary.price.state === 'unavailable' ? (
          <p>{summary.price.message}</p>
        ) : summary.price.state === 'known' ? (
          <strong>{summary.price.totalLabel}</strong>
        ) : summary.price.state === 'loading' ? (
          <p>{summary.price.previousTotalLabel ?? 'Loading price…'}</p>
        ) : summary.price.state === 'recalculating' ? (
          <p>{summary.price.previousTotalLabel} · Updating…</p>
        ) : (
          <p>{summary.price.previousTotalLabel ?? summary.price.message}</p>
        )}
      </div>

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
