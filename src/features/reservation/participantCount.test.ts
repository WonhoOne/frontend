import { describe, expect, it } from 'vitest';

import { formatParticipantCountSummary, validateParticipantCount } from '@/features/reservation';

describe('participantCount contract', () => {
  it('requires explicit selection instead of interpreting null as a minimum', () => {
    expect(validateParticipantCount('general', null)).toEqual({
      status: 'required',
      message: 'Select the number of participants.',
    });
    expect(validateParticipantCount('honeymoon', null)).toEqual({
      status: 'required',
      message: 'Select the number of participants.',
    });
  });

  it('accepts a General Reservation with one or more participants', () => {
    expect(validateParticipantCount('general', 1)).toEqual({
      status: 'valid',
      participantCount: 1,
      coupleCount: null,
    });
    expect(validateParticipantCount('general', 27)).toEqual({
      status: 'valid',
      participantCount: 27,
      coupleCount: null,
    });
  });

  it('does not invent a participant maximum', () => {
    expect(validateParticipantCount('general', 10_000).status).toBe('valid');
    expect(validateParticipantCount('honeymoon', 10_000).status).toBe('valid');
  });

  it('rejects non-integer participant counts', () => {
    expect(validateParticipantCount('general', 1.5)).toMatchObject({
      status: 'invalid',
      reason: 'integer-required',
    });
    expect(validateParticipantCount('honeymoon', 2.5)).toMatchObject({
      status: 'invalid',
      reason: 'integer-required',
    });
  });

  it('requires at least two participants for a Honeymoon Reservation', () => {
    expect(validateParticipantCount('honeymoon', 1)).toMatchObject({
      status: 'invalid',
      reason: 'minimum',
    });
  });

  it('requires each Honeymoon Reservation to contain complete pairs', () => {
    expect(validateParticipantCount('honeymoon', 3)).toMatchObject({
      status: 'invalid',
      reason: 'honeymoon-pair-required',
    });
  });

  it('derives couple/team count only from valid Honeymoon Reservation input', () => {
    expect(validateParticipantCount('honeymoon', 4)).toEqual({
      status: 'valid',
      participantCount: 4,
      coupleCount: 2,
    });
    expect(formatParticipantCountSummary(validateParticipantCount('honeymoon', 4))).toBe(
      '4 participants · 2 couples/teams',
    );
    expect(formatParticipantCountSummary(validateParticipantCount('honeymoon', 3))).toBeNull();
  });

  it('does not reinterpret the schedule confirmation rule as a Reservation minimum of four', () => {
    expect(validateParticipantCount('honeymoon', 2)).toEqual({
      status: 'valid',
      participantCount: 2,
      coupleCount: 1,
    });
  });
});
