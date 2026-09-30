import { describe, expect, it } from 'vitest';

import {
  createContractNeutralConfigureFixture,
  getConfigureReadiness,
} from '@/features/configuration';
import { createEmptyReservationDraft, type ReservationDraftV1 } from '@/features/reservation';

function readyDraft(): ReservationDraftV1 {
  return {
    ...createEmptyReservationDraft(1),
    tourProductId: 'tour-a',
    tourScheduleId: 'schedule-a',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'fixture:hotel:a',
      transportSelectionKey: 'fixture:transport:a',
      mealSelectionKey: 'fixture:meal:a',
      extraSelectionKeys: [],
    },
  };
}

describe('Configure readiness', () => {
  it('requires Tour, Style, Schedule, participants and the three required selections', () => {
    const fixture = createContractNeutralConfigureFixture();

    expect(
      getConfigureReadiness({
        draft: createEmptyReservationDraft(1),
        expectedTourProductId: 'tour-a',
        groups: fixture.groups,
        participantRule: 'general',
      }),
    ).toEqual({
      isReady: false,
      issues: ['tour-context', 'style', 'schedule', 'participants', 'hotel', 'transport', 'meal'],
    });
  });

  it('allows Review when all currently knowable Frontend requirements are complete', () => {
    const fixture = createContractNeutralConfigureFixture();

    expect(
      getConfigureReadiness({
        draft: readyDraft(),
        expectedTourProductId: 'tour-a',
        groups: fixture.groups,
        participantRule: 'general',
      }),
    ).toEqual({
      isReady: true,
      issues: [],
    });
  });

  it('rejects a stale selection key that is not in the current selectable group', () => {
    const fixture = createContractNeutralConfigureFixture();
    const draft = readyDraft();

    expect(
      getConfigureReadiness({
        draft: {
          ...draft,
          configuration: {
            ...draft.configuration,
            transportSelectionKey: 'fixture:transport:missing',
          },
        },
        expectedTourProductId: 'tour-a',
        groups: fixture.groups,
        participantRule: 'general',
      }),
    ).toMatchObject({
      isReady: false,
      issues: ['transport'],
    });
  });

  it('does not require Extras while its exact selection contract remains unresolved', () => {
    const fixture = createContractNeutralConfigureFixture();

    expect(
      getConfigureReadiness({
        draft: readyDraft(),
        expectedTourProductId: 'tour-a',
        groups: fixture.groups,
        participantRule: 'general',
      }).issues,
    ).not.toContain('extras');
  });
});
