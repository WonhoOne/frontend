// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import {
  reservationDraftReducer,
  type ReservationDraftAction,
  type ReservationDraftV1,
} from '@/features/reservation';

import type { VoiceCommand } from '../../integrations/voice/voiceCommand';
import { executeVoiceCommand } from './voiceCommandBridge';
import {
  createReservationDraftVoiceCapabilities,
  type ReservationDraftVoiceCapabilities,
  type ReservationDraftVoiceContext,
} from './reservationDraftVoiceAdapter';

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

function harness(options?: { draft?: ReservationDraftV1; context?: ReservationDraftVoiceContext }) {
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
    const h = harness({ draft: configuredDraft({ tourStyle: 'GRAND', participantCount: 2 }) });

    execute({ version: 1, command: 'SELECT_STYLE', args: { style: 'PREMIUM' } }, h.capabilities);
    execute(
      { version: 1, command: 'SET_PARTICIPANT_COUNT', args: { participantCount: 4 } },
      h.capabilities,
    );

    expect(h.dispatch.mock.calls.map(([action]) => action)).toEqual([
      { type: 'SELECT_TOUR_STYLE', tourStyle: 'PREMIUM', updatedAt: 999 },
      { type: 'SET_PARTICIPANT_COUNT', participantCount: 4, updatedAt: 999 },
    ]);
  });

  it('uses current GUI resolvers for opaque configuration selection keys', () => {
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
      { version: 1, command: 'CHANGE_MEAL', args: { mealOption: 'PREMIUM_RESTAURANT' } },
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

  it('keeps extra add/remove unique and targeted', () => {
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

    execute(
      { version: 1, command: 'ADD_OPTION', args: { extraOption: 'CHAMPAGNE' } },
      h.capabilities,
    );
    expect(h.dispatch).not.toHaveBeenCalled();

    execute({ version: 1, command: 'ADD_OPTION', args: { extraOption: 'COFFEE' } }, h.capabilities);
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
  });

  it('shares canonical GUI Extras with Voice add/remove through one reducer Draft', () => {
    let draft = configuredDraft({
      configuration: {
        hotelSelectionKey: 'HOTEL_5_STAR',
        transportSelectionKey: 'PRIVATE_LUXURY_CAR_2',
        mealSelectionKey: 'PREMIUM_RESTAURANT',
        extraSelectionKeys: ['CHAMPAGNE'],
      },
    });
    const context = selectableContext();
    context.resolveExtraSelectionKey = (extraOption) => extraOption;
    const dispatch = vi.fn((action: ReservationDraftAction) => {
      draft = reservationDraftReducer(draft, action);
    });
    const capabilities = createReservationDraftVoiceCapabilities({
      getDraft: () => draft,
      getContext: () => context,
      dispatch,
      now: () => 300,
    });

    // Voice removes Premium's default; GUI does not reinstate it.
    expect(
      execute(
        { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'CHAMPAGNE' } },
        capabilities,
      ).ok,
    ).toBe(true);
    expect(draft.configuration.extraSelectionKeys).toEqual([]);

    // GUI adds Coffee and the following Voice command reads the updated Draft.
    dispatch({ type: 'SET_EXTRAS', selectionKeys: ['COFFEE'], updatedAt: 301 });
    expect(
      execute(
        { version: 1, command: 'ADD_OPTION', args: { extraOption: 'CHAMPAGNE' } },
        capabilities,
      ).ok,
    ).toBe(true);
    expect(draft.configuration.extraSelectionKeys).toEqual(['COFFEE', 'CHAMPAGNE']);

    const beforeDuplicate = dispatch.mock.calls.length;
    expect(
      execute(
        { version: 1, command: 'ADD_OPTION', args: { extraOption: 'CHAMPAGNE' } },
        capabilities,
      ).ok,
    ).toBe(true);
    expect(dispatch).toHaveBeenCalledTimes(beforeDuplicate);

    // GUI normalization and a later Voice removal use the same canonical keys.
    dispatch({ type: 'SET_EXTRAS', selectionKeys: ['CHAMPAGNE', 'COFFEE'], updatedAt: 302 });
    expect(
      execute(
        { version: 1, command: 'REMOVE_OPTION', args: { extraOption: 'COFFEE' } },
        capabilities,
      ).ok,
    ).toBe(true);
    expect(draft.configuration.extraSelectionKeys).toEqual(['CHAMPAGNE']);
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

    for (const command of commands) expect(execute(command, h.capabilities).ok).toBe(true);
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

    h.setContext(selectableContext());
    h.setDraft(configuredDraft({ tourStyle: 'CLASSIC' }));
    expect(
      execute({ version: 1, command: 'SELECT_STYLE', args: { style: 'PREMIUM' } }, h.capabilities),
    ).toEqual({ ok: true, command: 'SELECT_STYLE' });
    expect(h.getContext).toHaveBeenCalledTimes(2);
    expect(h.getDraft).toHaveBeenCalledTimes(2);
  });

  it('rejects unavailable GUI selections and missing Draft prerequisites without mutation', () => {
    const context = selectableContext();
    context.canSelectSchedule = () => false;
    context.resolveMealSelectionKey = () => null;
    const h = harness({ context });

    expect(
      execute({ version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 777 } }, h.capabilities)
        .ok,
    ).toBe(false);
    expect(
      execute(
        { version: 1, command: 'CHANGE_MEAL', args: { mealOption: 'LUNCH_BOX' } },
        h.capabilities,
      ).ok,
    ).toBe(false);

    h.setDraft(configuredDraft({ tourProductId: null, tourScheduleId: null, tourStyle: null }));
    expect(
      execute({ version: 1, command: 'SELECT_STYLE', args: { style: 'GRAND' } }, h.capabilities).ok,
    ).toBe(false);
    expect(h.dispatch).not.toHaveBeenCalled();
    expect(h.now).not.toHaveBeenCalled();
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

  it('keeps V6-B production code effect-free', () => {
    const adapterUrl = new URL('./reservationDraftVoiceAdapter.ts', import.meta.url);
    const source = readFileSync(adapterUrl, 'utf8');
    const imports = [...source.matchAll(/from ['"]([^'"]+)['"]/g)].map((match) => match[1]);

    expect(imports).toEqual([
      '@/features/reservation',
      '@/shared/lib/resourceIdentity',
      '../../integrations/voice/voiceCommand',
      './voiceCommandBridge',
    ]);
    expect(source).not.toMatch(
      /\b(?:submitReservation|createReservation|postReservation|confirmReservation)\b|SUBMIT_RESERVATION|\/api\/v1\/reservations|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|window\.|router|navigate|React|useReservationDraft/,
    );
  });
});
