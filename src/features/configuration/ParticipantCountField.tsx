import { type ChangeEvent } from 'react';

import {
  formatParticipantCountSummary,
  validateParticipantCount,
  type ParticipantCountRule,
} from '@/features/reservation';
import { TextField } from '@/shared/ui';

import styles from '@/features/configuration/ParticipantCountField.module.css';

interface ParticipantCountFieldProps {
  participantCount: number | null;
  rule: ParticipantCountRule;
  onParticipantCountChange: (participantCount: number | null) => void;
}

function readParticipantCount(event: ChangeEvent<HTMLInputElement>): number | null {
  if (event.currentTarget.value === '') {
    return null;
  }

  const value = event.currentTarget.valueAsNumber;
  return Number.isNaN(value) ? null : value;
}

/**
 * Configure의 explicit participant selection control.
 *
 * Transaction state는 ReservationDraft가 소유하고 이 component는 controlled UI만 제공한다.
 * HTML min/step은 입력 보조일 뿐이며 실제 contract validation은 validateParticipantCount가 담당한다.
 */
export function ParticipantCountField({
  participantCount,
  rule,
  onParticipantCountChange,
}: ParticipantCountFieldProps) {
  const validation = validateParticipantCount(rule, participantCount);
  const summary = formatParticipantCountSummary(validation);
  const messageProps =
    validation.status === 'invalid'
      ? { error: validation.message }
      : validation.status === 'required'
        ? {
            helperText:
              rule === 'honeymoon'
                ? 'Choose an even number of participants. One couple/team is 2 participants.'
                : 'Choose the number of participants for this reservation.',
          }
        : {};

  return (
    <div className={styles.root}>
      <TextField
        {...messageProps}
        inputMode="numeric"
        label="Participants"
        min={rule === 'honeymoon' ? 2 : 1}
        onChange={(event) => onParticipantCountChange(readParticipantCount(event))}
        required
        step={rule === 'honeymoon' ? 2 : 1}
        type="number"
        value={participantCount ?? ''}
      />

      {summary !== null ? (
        <p className={styles.summary} data-testid="participant-summary">
          {summary}
        </p>
      ) : null}
    </div>
  );
}
