import { describe, expect, it } from 'vitest';

import {
  createContractNeutralConfigureFixture,
  isConfigurationFixtureSelectionKey,
} from '@/features/configuration';
import {
  parseReservationDraft,
  validateParticipantCount,
  type ReservationDraftV1,
} from '@/features/reservation';

function approvedBoundaryDraft(): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: 'frontend-route-tour-key',
    tourScheduleId: 'frontend-route-schedule-key',
    tourStyle: 'PREMIUM',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'fixture:hotel:a',
      transportSelectionKey: 'fixture:transport:a',
      mealSelectionKey: 'fixture:meal:a',
      extraSelectionKeys: [],
    },
    updatedAt: 1,
  };
}

describe('Shared Contract convergence gate — approved docs/main v0.1.2', () => {
  it('keeps participant validation to the approved minimum and Honeymoon pair semantics', () => {
    expect(validateParticipantCount('general', 1)).toMatchObject({
      status: 'valid',
      participantCount: 1,
    });
    expect(validateParticipantCount('honeymoon', 2)).toEqual({
      status: 'valid',
      participantCount: 2,
      coupleCount: 1,
    });
    expect(validateParticipantCount('honeymoon', 3)).toMatchObject({
      status: 'invalid',
      reason: 'honeymoon-pair-required',
    });
  });

  it('does not invent the still-TBD participant maximum', () => {
    expect(validateParticipantCount('general', 10_000).status).toBe('valid');
    expect(validateParticipantCount('honeymoon', 10_000).status).toBe('valid');
  });

  it('keeps Draft resource identity as a frontend route-safe string rather than a wire-ID claim', () => {
    expect(parseReservationDraft(approvedBoundaryDraft())).toEqual(approvedBoundaryDraft());
  });

  it('keeps configuration choices fixture-owned while canonical option identity is blocked', () => {
    const fixture = createContractNeutralConfigureFixture();

    expect(fixture.source).toBe('fixture');
    expect(
      fixture.groups
        .flatMap((group) => group.options)
        .every((option) => isConfigurationFixtureSelectionKey(option.selectionKey)),
    ).toBe(true);

    for (const option of fixture.groups.flatMap((group) => group.options)) {
      expect(option).not.toHaveProperty('id');
      expect(option).not.toHaveProperty('canonicalId');
      expect(option).not.toHaveProperty('capacity');
      expect(option).not.toHaveProperty('unitPrice');
      expect(option).not.toHaveProperty('priceDelta');
    }
  });

  it('keeps Extras interaction contract-dependent and price truth unavailable in the neutral fixture', () => {
    const fixture = createContractNeutralConfigureFixture();
    const extras = fixture.groups.find((group) => group.category === 'extras');

    expect(extras).toMatchObject({
      required: false,
      selectionMode: 'contract-dependent',
    });
    expect(fixture.tripSummary.price).toEqual({
      state: 'unavailable',
      message: 'Price is not available in the contract-neutral fixture.',
    });
  });

  it('keeps server-owned price and discount truth outside ReservationDraft', () => {
    const draft = approvedBoundaryDraft();

    expect(draft).not.toHaveProperty('price');
    expect(draft).not.toHaveProperty('totalPrice');
    expect(draft).not.toHaveProperty('discount');
    expect(draft).not.toHaveProperty('loyalty');
    expect(draft.configuration).not.toHaveProperty('price');
  });
});
