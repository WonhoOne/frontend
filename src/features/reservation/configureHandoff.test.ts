import { describe, expect, it } from 'vitest';

import { createConfigureHandoffAction, type ConfigureHandoffIntent } from '@/features/reservation';

describe('Configure public handoff action', () => {
  it('maps only the selected Tour Detail transaction context into a public Draft action', () => {
    const intent: ConfigureHandoffIntent = {
      tourProductId: 42,
      tourStyle: 'GRAND',
      tourScheduleId: 7,
    };

    expect(createConfigureHandoffAction(intent, 123)).toEqual({
      type: 'BEGIN_CONFIGURE',
      tourProductId: 42,
      tourStyle: 'GRAND',
      tourScheduleId: 7,
      updatedAt: 123,
    });
  });

  it('does not add participant, configuration, price, availability, or navigation state', () => {
    const action = createConfigureHandoffAction(
      {
        tourProductId: 42,
        tourStyle: 'PREMIUM',
        tourScheduleId: 9,
      },
      456,
    );

    expect(action).not.toHaveProperty('participantCount');
    expect(action).not.toHaveProperty('configuration');
    expect(action).not.toHaveProperty('price');
    expect(action).not.toHaveProperty('availability');
    expect(action).not.toHaveProperty('route');
    expect(action).not.toHaveProperty('navigate');
  });
});
