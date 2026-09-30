import { describe, expect, it } from 'vitest';

import {
  CONFIGURATION_GROUP_ORDER,
  createContractNeutralConfigureFixture,
  isConfigurationFixtureSelectionKey,
  type PriceDisplayModel,
} from '@/features/configuration';

describe('configuration model boundary', () => {
  it('keeps the Configure group order required by the screen plan', () => {
    expect(CONFIGURATION_GROUP_ORDER).toEqual(['hotel', 'transport', 'meal', 'extras']);
  });

  it('keeps required categories explicit without inventing an Extras selection mode', () => {
    const fixture = createContractNeutralConfigureFixture();

    expect(
      fixture.groups.map(({ category, required, selectionMode }) => ({
        category,
        required,
        selectionMode,
      })),
    ).toEqual([
      { category: 'hotel', required: true, selectionMode: 'single' },
      { category: 'transport', required: true, selectionMode: 'single' },
      { category: 'meal', required: true, selectionMode: 'single' },
      { category: 'extras', required: false, selectionMode: 'contract-dependent' },
    ]);
  });

  it('marks all demo option identities as fixture-only instead of canonical IDs', () => {
    const fixture = createContractNeutralConfigureFixture();
    const optionKeys = fixture.groups.flatMap((group) =>
      group.options.map((option) => option.selectionKey),
    );

    expect(fixture.source).toBe('fixture');
    expect(optionKeys.length).toBeGreaterThan(0);
    expect(optionKeys.every(isConfigurationFixtureSelectionKey)).toBe(true);
  });

  it('does not invent price truth in the contract-neutral fixture', () => {
    const fixture = createContractNeutralConfigureFixture();

    expect(fixture.tripSummary.price).toEqual({
      state: 'unavailable',
      message: 'Price is not available in the contract-neutral fixture.',
    });
  });

  it('supports presentation-only price states without defining a calculation formula', () => {
    const states: PriceDisplayModel[] = [
      { state: 'unavailable', message: 'Unavailable' },
      { state: 'known', totalLabel: 'Displayed total' },
      { state: 'loading', previousTotalLabel: null },
      { state: 'recalculating', previousTotalLabel: 'Previous total' },
      { state: 'error', previousTotalLabel: 'Previous total', message: 'Retry price.' },
    ];

    expect(states.map((state) => state.state)).toEqual([
      'unavailable',
      'known',
      'loading',
      'recalculating',
      'error',
    ]);
  });

  it('keeps summary context and current selections separate from option catalog objects', () => {
    const fixture = createContractNeutralConfigureFixture();

    expect(fixture.tripSummary).toMatchObject({
      participantLabel: null,
      selections: {
        hotelLabel: null,
        transportLabel: null,
        mealLabel: null,
        extraLabels: [],
      },
    });

    for (const option of fixture.groups.flatMap((group) => group.options)) {
      expect(option).not.toHaveProperty('price');
      expect(option).not.toHaveProperty('id');
      expect(option).not.toHaveProperty('backendId');
    }
  });
});
