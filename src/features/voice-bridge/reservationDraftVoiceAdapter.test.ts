// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import type { ReservationDraftAction, ReservationDraftV1 } from '@/features/reservation';

import type { VoiceCommand } from '../../integrations/voice/voiceCommand';
import {
  createReservationDraftVoiceCapabilities,
  executeVoiceCommand,
  type ReservationDraftVoiceCapabilities,
  type ReservationDraftVoiceContext,
} from './index';

function configuredDraft(overrides: Partial<ReservationDraftV1> = {}): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: '103',
    tourScheduleId: '501',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'fixture:hotel:grand',
      transportSelectionKey: 'fixture:transport:car',
      mealSelectionKey: 'fixture:meal:local',
      extraSelectionKeys: ['fixture:extra:champagne'],
    },
    updatedAt: 100,
    ...overrides,
  };
}

function selectableContext(): ReservationDraftVoiceContext {
  return {
    canSelectTourProduct: () => true,
    canSelectStyle: () => true,
    canSelectSchedule: () => true,
    canSetParticipantCount: () => true,
    resolveHotelSelectionKey: (hotelOption) => `fixture:hotel:${hotelOption}`,
    resolveTransportSelectionKey: (transportOption) => `fixture:transport:${transportOption}`,
    resolveMealSelectionKey: (mealOption) => `fixture:meal:${mealOption}`,
    resolveExtraSelectionKey: (extraOption) => `fixture:extra:${extraOption}`,
  };
}

function harness(options?: {
  draft?: ReservationDraftV1;
  context?: ReservationDraftVoiceContext;
}) {
  let draft = options?.draft ?? configuredDraft();
  let context = options?.context ?? selectableContext();
  const dispatch = vi.fn<(action: ReservationDraftAction) => void>();
  const now = vi.fn(() => 999);
  const getDraft = vi.fn(() => draft);
  const getContext = vi.fn(() => context);
  const capabilities = createReservationDraftVoiceCapabilities({
    getDraft,
    getContext,
    dispatch,
    now,
  });

  return {
    capabilities,
    dispatch,
    getContext,
    getDraft,
    now,
    setContext(next: ReservationDraftVoiceContext) {
      context = next;
    },
    setDraft(next: ReservationDraftV1) {
      draft = next;
    },
  };
}

function execute(command: VoiceCommand, capabilities: ReservationDraftVoiceCapabilities) {
  return executeVoiceCommand(command, capabilities);
}

describe('ReservationDraft Voice adapter', () => {
  it('exposes only the nine ReservationDraft-related V6-A capabilities', () => {
    const { capabilities } = harness();

    expect(Object.keys(capabilities)).toEqual([
      'selectTourProduct',
      'selectStyle',
      'selectSchedule',
      'setParticipantCount',
      'changeHotel',
      'changeTransport',
      'changeMeal',
      'addOption',
      'removeOption',
    ]);
    expectTypeOf<keyof ReservationDraftVoiceCapabilities>().toEqualTypeOf<
      | 'selectTourProduct'
      | 'selectStyle'
      | 'selectSchedule'
      | 'setParticipantCount'
      | 'changeHotel'
      | 'changeTransport'
      | 'changeMeal'
      | 'addOption'
      | 'removeOption'
    >();
  });

  it('converts numeric TourProduct identity through the canonical Frontend boundary', () => {
    const h = harness({ draft: configuredDraft({ tourProductId: '102' }) });

    expect(
      execute(
        { version: 1, command: 'SELECT_TOUR_PRODUCT', args: { tourProductId: 103 } },
        h.capabilities,
      ),
    ).toEqual({ ok: true, command: 'SELECT_TOUR_PRODUCT' });
    expect(h.dispatch).toHaveBeenCalledExactlyOnceWith({
      type: 'START_DRAFT',
      tourProductId: '103',
      updatedAt: 999,
    });
    expect(h.now).toHaveBeenCalledOnce();
  });

  it('converts numeric TourSchedule identity through the canonical Frontend boundary', () => {
    const h = harness({ draft: configuredDraft({ tourScheduleId: '500' }) });

    expect(
      execute(
        { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 501 } },
        h.capabilities,
      ),
    ).toEqual({ ok: true, command: 'SELECT_SCHEDULE' });
    expect(h.dispatch).toHaveBeenCalledExactlyOnceWith({
      type: 'SELECT_SCHEDULE',
      tourScheduleId: '501',
      updatedAt: 999,
    });
  });

  it('maps style and participant commands to the existing reducer actions', () => {
    const h = harness({
      draft: configuredDraft({ tourStyle: 'GRAND', participantCount: 2 }),
    });

    expect(
      execute({ version: 1, command: 'SELECT_STYLE', args: { style: 'PREMIUM' } }, h.capabilities),
    ).toEqual({ ok: true, command: 'SELECT_STYLE' });
    expect(
      execute(
        { version: 1, command: 'SET_PARTICIPANT_COUNT', args: { participantCount: 4 } },
        h.capabilities,
      ),
    ).toEqual({ ok: true, command: 'SET_PARTICIPANT_COUNT' });

    expect(h.dispatch.mock.calls.map(([action]) => action)).toEqual([
      { type: 'SELECT_TOUR_STYLE', tourStyle: 'PREMIUM', updatedAt: 999 },
      { type: 'SET_PARTICIPANT_COUNT', participantCount: 4, updatedAt: 999 },
    ]);
  });

  it('uses current GUI resolvers for opaque Hotel/Transport/Meal selection keys', () => {
    const context = selectableContext();
    context.resolveHotelSelectionKey = vi.fn(() => 'opaque:hotel:five');
    context.resolveTransportSelectionKey = vi.fn(() => 'opaque:transport:van');
    context.resolveMealSelectionKey = vi.fn(() => 'opaque:meal:premium');
    const h = harness({ context });

    execute(
      { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption: 'HOTEL_5_STAR' } },
      h.capabilities,
    );
    execute(
      {
        version: 1,
        command: 'CHANGE_TRANSPORT',
        args: { transportOption: 'PREMIUM_VAN_10' },
      },
      h.capabilities,
    );
    execute(
      {
        version: 1,
        command: 'CHANGE_MEAL',
        args: { mealOption: 'PREMIUM_RESTAURANT' },
      },
      h.capabilities,
    );

    expect(context.resolveHotelSelectionKey).toHaveBeenCalledExactlyOnceWith('HOTEL_5_STAR');
    expect(context.resolveTransportSelectionKey).toHaveBeenCalledExactlyOnceWith('PREMIUM_VAN_10');
    expect(context.resolveMealSelectionKey).toHaveBeenCalledExactlyOnceWith('PREMIUM_RESTAURANT');
    expect(h.dispatch.mock.calls.map(([action]) => action)).toEqual([
      { type: 'SELECT_HOTEL', selectionKey: 'opaque:hotel:five', updatedAt: 999 },
      { type: 'SELECT_TRANSPORT', selectionKey: 'opaque:transport:van', updatedAt: 999 },
      { type: 'SELECT_MEAL', selectionKey: 'opaque:meal:premium', updatedAt: 999 },
    ]);
  });

  it('adds and removes extras through SET_EXTRAS without duplication or unrelated removal', () => {
    const h = harness({
      draft: configuredDraft({
        configuration: {
          hotelSelectionKey: 'fixture:hotel:grand',
          transportSelectionKey: 'fixture:transport:car',
          mealSelectionKey: 'fixture:meal:local',
          extraSelectionKeys: ['fixture:extra:CHAMPAGNE'],
        },
      }),
    });

    expect(
      execute(
        { version: 1, command: 'ADD_OPTION', args: { extraOption: 'CHAMPAGNE' } },
        h.capabilities,
      ),
    ).toEqual({ ok: true, command: 'ADD_OPTION' });
    expect(h.dispatch).not.toHaveBeenCalled();

    execute(
      { version: 1, command: 'ADD_OPTION', args: { extraOption: 'COFFEE' } },
      h.capabilities,
    );
    expect(h.dispatch).toHaveBeenLastCalledWith({
      type: 'SET_EXTRAS',
      selectionKeys: ['fixture:extra:CHAMPAGNE', 'fixture:extra:COFFEE'],
      updatedAt: 999,
    });

    h.dispatch.mockClear();
    h.setDraft(
      configuredDraft({
        configuration: {
          hotelSelectionKey: 'fixture:hotel:grand',
          transportSelectionKey: 'fixture:transport:car',
          mealSelectionKey: 'fixture:meal:local',
          extraSelectionKeys: ['fixture:extra:CHAMPAGNE', 'fixture:extra:COFFEE'],
        },
      }),
    );
    execute(
      { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'CHAMPAGNE' } },
      h.capabilities,
    );
    expect(h.dispatch).toHaveBeenCalledExactlyOnceWith({
      type: 'SET_EXTRAS',
      selectionKeys: ['fixture:extra:COFFEE'],
      updatedAt: 999,
    });

    h.dispatch.mockClear();
    h.setDraft(
      configuredDraft({
        configuration: {
          hotelSelectionKey: 'fixture:hotel:grand',
          transportSelectionKey: 'fixture:transport:car',
          mealSelectionKey: 'fixture:meal:local',
          extraSelectionKeys: ['fixture:extra:COFFEE'],
        },
      }),
    );
    expect(
      execute(
        { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'CHAMPAGNE' } },
        h.capabilities,
      ),
    ).toEqual({ ok: true, command: 'REMOVE_OPTION' });
    expect(h.dispatch).not.toHaveBeenCalled();
  });

  it('is idempotent for repeated commands that already match the Draft', () => {
    const context = selectableContext();
    context.resolveHotelSelectionKey = () => 'fixture:hotel:grand';
    const h = harness({ context });

    const commands: VoiceCommand[] = [
      { version: 1, command: 'SELECT_TOUR_PRODUCT', args: { tourProductId: 103 } },
      { version: 1, command: 'SELECT_STYLE', args: { style: 'GRAND' } },
      { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 501 } },
      { version: 1, command: 'SET_PARTICIPANT_COUNT', args: { participantCount: 2 } },
      { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption: 'HOTEL_4_STAR' } },
    ];

    for (const command of commands) {
      expect(execute(command, h.capabilities).ok).toBe(true);
    }
    expect(h.dispatch).not.toHaveBeenCalled();
    expect(h.now).not.toHaveBeenCalled();
  });

  it('reads Draft and GUI context fresh on every invocation', () => {
    const firstContext = selectableContext();
    firstContext.canSelectStyle = () => false;
    const h = harness({ context: firstContext });

    expect(
      execute({ version: 1, command: 'SELECT_STYLE', args: { style: 'PREMIUM' } }, h.capabilities),
    ).toEqual({
      ok: false,
      command: 'SELECT_STYLE',
      error: { code: 'CAPABILITY_FAILED' },
    });
    expect(h.dispatch).not.toHaveBeenCalled();

    const secondContext = selectableContext();
    h.setContext(secondContext);
    h.setDraft(configuredDraft({ tourStyle: 'CLASSIC' }));

    expect(
      execute({ version: 1, command: 'SELECT_STYLE', args: { style: 'PREMIUM' } }, h.capabilities),
    ).toEqual({ ok: true, command: 'SELECT_STYLE' });
    expect(h.getContext).toHaveBeenCalledTimes(2);
    expect(h.getDraft).toHaveBeenCalledTimes(2);
    expect(h.dispatch).toHaveBeenCalledExactlyOnceWith({
      type: 'SELECT_TOUR_STYLE',
      tourStyle: 'PREMIUM',
      updatedAt: 999,
    });
  });

  it('rejects unavailable GUI selections without Draft mutation', () => {
    const context = selectableContext();
    context.canSelectSchedule = () => false;
    context.resolveMealSelectionKey = () => null;
    const h = harness({ context });

    expect(
      execute(
        { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 777 } },
        h.capabilities,
      ),
    ).toEqual({
      ok: false,
      command: 'SELECT_SCHEDULE',
      error: { code: 'CAPABILITY_FAILED' },
    });
    expect(
      execute(
        { version: 1, command: 'CHANGE_MEAL', args: { mealOption: 'LUNCH_BOX' } },
        h.capabilities,
      ),
    ).toEqual({
      ok: false,
      command: 'CHANGE_MEAL',
      error: { code: 'CAPABILITY_FAILED' },
    });
    expect(h.dispatch).not.toHaveBeenCalled();
    expect(h.now).not.toHaveBeenCalled();
  });

  it('requires product/configure context before dependent Draft actions', () => {
    const h = harness({
      draft: configuredDraft({ tourProductId: null, tourScheduleId: null, tourStyle: null }),
    });

    for (const command of [
      { version: 1, command: 'SELECT_STYLE', args: { style: 'GRAND' } },
      { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 501 } },
      { version: 1, command: 'SET_PARTICIPANT_COUNT', args: { participantCount: 2 } },
      { version: 1, command: 'CHANGE_HOTEL', args: { hotelOption: 'HOTEL_4_STAR' } },
    ] satisfies VoiceCommand[]) {
      expect(execute(command, h.capabilities).ok).toBe(false);
    }
    expect(h.dispatch).not.toHaveBeenCalled();
  });

  it('defensively rejects invalid runtime numeric IDs before dispatch', () => {
    const h = harness();
    const invalidProduct = {
      version: 1,
      command: 'SELECT_TOUR_PRODUCT',
      args: { tourProductId: 0 },
    } as VoiceCommand;
    const invalidSchedule = {
      version: 1,
      command: 'SELECT_SCHEDULE',
      args: { scheduleId: Number.MAX_SAFE_INTEGER + 1 },
    } as VoiceCommand;

    expect(execute(invalidProduct, h.capabilities).ok).toBe(false);
    expect(execute(invalidSchedule, h.capabilities).ok).toBe(false);
    expect(h.dispatch).not.toHaveBeenCalled();
  });

  it('keeps V6-B production code free of submit, network, storage, router, and React surfaces', () => {
    const source = readFileSync(new URL('./reservationDraftVoiceAdapter.ts', import.meta.url), 'utf8');
    const imports = [...source.matchAll(/from ['"]([^'"]+)['"]/g)].map((match) => match[1]);

    expect(imports).toEqual([
      '@/features/reservation',
      '@/shared/lib/resourceIdentity',
      '../../integrations/voice/voiceCommand',
      './voiceCommandBridge',
    ]);
    expect(source).not.toMatch(
      /submitReservation|createReservation|postReservation|confirmReservation|SUBMIT_RESERVATION|\/api\/v1\/reservations|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|window\.|router|navigate|React|useReservationDraft/,
    );
  });
});
