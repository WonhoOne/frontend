// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { ParticipantCountField } from '@/features/configuration';
import type { ParticipantCountRule } from '@/features/reservation';

function ParticipantHarness({ rule }: { rule: ParticipantCountRule }) {
  const [participantCount, setParticipantCount] = useState<number | null>(null);

  return (
    <ParticipantCountField
      onParticipantCountChange={setParticipantCount}
      participantCount={participantCount}
      rule={rule}
    />
  );
}

describe('ParticipantCountField', () => {
  it('starts empty so the user must make an explicit selection', () => {
    render(<ParticipantHarness rule="general" />);

    const input = screen.getByRole('spinbutton', { name: /participants/i });

    expect(input).toHaveValue(null);
    expect(input).toHaveAttribute('min', '1');
    expect(input).not.toHaveAttribute('max');
    expect(
      screen.getByText('Choose the number of participants for this reservation.'),
    ).toBeVisible();
  });

  it('keeps Honeymoon input pair-oriented without creating a maximum', () => {
    render(<ParticipantHarness rule="honeymoon" />);

    const input = screen.getByRole('spinbutton', { name: /participants/i });

    expect(input).toHaveAttribute('min', '2');
    expect(input).toHaveAttribute('step', '2');
    expect(input).not.toHaveAttribute('max');
  });

  it('shows a contract error for an odd Honeymoon participant count', () => {
    render(<ParticipantHarness rule="honeymoon" />);

    fireEvent.change(screen.getByRole('spinbutton', { name: /participants/i }), {
      target: { value: '3' },
    });

    expect(
      screen.getByText('Honeymoon participants must be selected in complete pairs.'),
    ).toBeVisible();
    expect(screen.queryByTestId('participant-summary')).not.toBeInTheDocument();
  });

  it('shows derived couple/team meaning only for valid Honeymoon input', () => {
    render(<ParticipantHarness rule="honeymoon" />);

    fireEvent.change(screen.getByRole('spinbutton', { name: /participants/i }), {
      target: { value: '4' },
    });

    expect(screen.getByTestId('participant-summary')).toHaveTextContent(
      '4 participants · 2 couples/teams',
    );
  });

  it('allows a valid General Reservation with one participant', () => {
    render(<ParticipantHarness rule="general" />);

    fireEvent.change(screen.getByRole('spinbutton', { name: /participants/i }), {
      target: { value: '1' },
    });

    expect(screen.getByTestId('participant-summary')).toHaveTextContent('1 participant');
  });
});
