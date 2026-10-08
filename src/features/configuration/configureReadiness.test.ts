import { describe, expect, it } from 'vitest';

import {
  createContractNeutralConfigureFixture,
  createReadyConfigureRuntimeState,
  getConfigureReadiness,
} from '@/features/configuration';
import { createEmptyReservationDraft, type ReservationDraftV1 } from '@/features/reservation';

function readyDraft(): ReservationDraftV1 {
  return {
    ...createEmptyReservationDraft(1),
    tourProductId: '101',
    tourScheduleId: '1001',
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
        expectedTourProductId: '101',
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
        expectedTourProductId: '101',
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
        expectedTourProductId: '101',
        groups: fixture.groups,
        participantRule: 'general',
      }),
    ).toMatchObject({
      isReady: false,
      issues: ['transport'],
    });
  });

  it('keeps unselected Extras truly optional for the approved Shared v0.2 contract', () => {
    const fixture = createContractNeutralConfigureFixture();

    expect(
      getConfigureReadiness({
        draft: readyDraft(),
        expectedTourProductId: '101',
        groups: fixture.groups,
        participantRule: 'general',
      }).issues,
    ).not.toContain('extras');
  });

  it('blocks only selected unavailable Extras and recovers immediately after deselection', () => {
    const fixture = createContractNeutralConfigureFixture();
    const runtimeState = createReadyConfigureRuntimeState();
    runtimeState.groups.extras = { status: 'invalid' };
    const draft = readyDraft();
    const selected = {
      ...draft,
      configuration: {
        ...draft.configuration,
        extraSelectionKeys: ['fixture:extras:a'],
      },
    };

    const validate = (next: ReservationDraftV1) =>
      getConfigureReadiness({
        draft: next,
        expectedTourProductId: '101',
        groups: fixture.groups,
        participantRule: 'general',
        runtimeState,
      });
    expect(validate(selected)).toEqual({ isReady: false, issues: ['extras'] });
    expect(validate(draft)).toEqual({ isReady: true, issues: [] });

    const unavailableGroup = {
      ...fixture.groups.find((group) => group.category === 'extras')!,
      options: fixture.groups
        .find((group) => group.category === 'extras')!
        .options.map((option) =>
          option.selectionKey === 'fixture:extras:a'
            ? {
                ...option,
                availability: { status: 'disabled' as const, reason: 'Unavailable.' },
              }
            : option,
        ),
    };
    const unavailable = fixture.groups.map((group) =>
      group.category === 'extras' ? unavailableGroup : group,
    );
    const availableRuntime = createReadyConfigureRuntimeState();
    expect(
      getConfigureReadiness({
        draft: selected,
        expectedTourProductId: '101',
        groups: unavailable,
        participantRule: 'general',
        runtimeState: availableRuntime,
      }),
    ).toEqual({ isReady: false, issues: ['extras'] });
    expect(
      getConfigureReadiness({
        draft: { ...selected, configuration: { ...selected.configuration, extraSelectionKeys: [] } },
        expectedTourProductId: '101',
        groups: unavailable,
        participantRule: 'general',
        runtimeState: availableRuntime,
      }),
    ).toEqual({ isReady: true, issues: [] });
  });

  it('blocks Review for required loading, error, empty, and invalid group states', () => {
    const fixture = createContractNeutralConfigureFixture();

    for (const state of [
      { status: 'loading' } as const,
      { status: 'error', isRetrying: false } as const,
      { status: 'empty' } as const,
      { status: 'invalid' } as const,
    ]) {
      const runtimeState = createReadyConfigureRuntimeState();
      runtimeState.groups.transport = state;

      expect(
        getConfigureReadiness({
          draft: readyDraft(),
          expectedTourProductId: '101',
          groups: fixture.groups,
          participantRule: 'general',
          runtimeState,
        }),
      ).toMatchObject({
        isReady: false,
        issues: ['transport'],
      });
    }
  });

  it('keeps Review eligible while successful data is refreshing or stale', () => {
    const fixture = createContractNeutralConfigureFixture();

    for (const state of [{ status: 'refreshing' } as const, { status: 'stale' } as const]) {
      const runtimeState = createReadyConfigureRuntimeState();
      runtimeState.groups.transport = state;

      expect(
        getConfigureReadiness({
          draft: readyDraft(),
          expectedTourProductId: '101',
          groups: fixture.groups,
          participantRule: 'general',
          runtimeState,
        }),
      ).toEqual({
        isReady: true,
        issues: [],
      });
    }
  });

  it('does not invent an offline Review policy while the Shared Contract remains unresolved', () => {
    const fixture = createContractNeutralConfigureFixture();
    const runtimeState = createReadyConfigureRuntimeState();
    runtimeState.connectivity = 'offline';

    expect(
      getConfigureReadiness({
        draft: readyDraft(),
        expectedTourProductId: '101',
        groups: fixture.groups,
        participantRule: 'general',
        runtimeState,
      }),
    ).toEqual({
      isReady: true,
      issues: [],
    });
  });
});
