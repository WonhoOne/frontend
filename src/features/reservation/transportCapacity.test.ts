import { describe, expect, it } from 'vitest';

import { checkTransportCapacity, TRANSPORT_CAPACITY } from '@/features/reservation';

describe('checkTransportCapacity (BR-20)', () => {
  it('uses the Shared v0.2 capacities', () => {
    expect(TRANSPORT_CAPACITY).toEqual({ PRIVATE_LUXURY_CAR_2: 2, PREMIUM_VAN_10: 10 });
  });

  it('rejects more travellers than the selected transport can carry', () => {
    expect(
      checkTransportCapacity({
        participantCount: 4,
        transportSelectionKey: 'PRIVATE_LUXURY_CAR_2',
      }),
    ).toEqual({
      status: 'exceeded',
      transportOption: 'PRIVATE_LUXURY_CAR_2',
      capacity: 2,
      participantCount: 4,
    });
    expect(
      checkTransportCapacity({ participantCount: 11, transportSelectionKey: 'PREMIUM_VAN_10' })
        .status,
    ).toBe('exceeded');
  });

  it.each([
    [4, 'PREMIUM_VAN_10'],
    [2, 'PRIVATE_LUXURY_CAR_2'],
    [1, 'PRIVATE_LUXURY_CAR_2'],
    [10, 'PREMIUM_VAN_10'],
  ])('accepts %i travellers with %s', (participantCount, transportSelectionKey) => {
    expect(checkTransportCapacity({ participantCount, transportSelectionKey }).status).toBe('fits');
  });

  it('does not block a draft that has not chosen both values yet', () => {
    expect(
      checkTransportCapacity({
        participantCount: null,
        transportSelectionKey: 'PRIVATE_LUXURY_CAR_2',
      }),
    ).toEqual({ status: 'incomplete' });
    expect(checkTransportCapacity({ participantCount: 4, transportSelectionKey: null })).toEqual({
      status: 'incomplete',
    });
  });

  it('does not guess a capacity for a non-canonical selection key', () => {
    expect(
      checkTransportCapacity({ participantCount: 4, transportSelectionKey: 'fixture:transport:a' }),
    ).toEqual({ status: 'incomplete' });
  });
});
