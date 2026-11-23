import { describe, expect, it } from 'vitest';

import {
  ContractMappingError,
  decodeApiErrorDto,
  decodeEmployeeTourScheduleListDto,
  decodeScheduleCompletionDto,
  decodeScheduleDepartureDto,
} from '@/integrations/backend/contracts';

const schedule = {
  id: 5,
  tourId: 2,
  tourName: 'Synthetic Trekking',
  theme: 'OUTDOOR_TREKKING',
  startDate: '2026-12-19',
  endDate: '2026-12-21',
  participantCount: 3,
  confirmed: true,
  operationStatus: 'SCHEDULED',
};

describe('Employee tour-schedule contract (v0.3 demo)', () => {
  it('decodes the schedule list', () => {
    expect(decodeEmployeeTourScheduleListDto([schedule])).toEqual([schedule]);
  });

  it.each([
    [{ ...schedule, operationStatus: 'CANCELLED' }],
    [{ ...schedule, theme: 'BEACH' }],
    [{ ...schedule, confirmed: 'yes' }],
    [{ ...schedule, participantCount: -1 }],
    [{ ...schedule, startDate: '2026-12-22' }],
    [{ ...schedule, id: 0 }],
  ])('rejects a schedule it cannot trust: %j', (value) => {
    expect(() => decodeEmployeeTourScheduleListDto([value])).toThrow(ContractMappingError);
  });

  it('decodes a departure with the deducted items and remaining stock', () => {
    expect(
      decodeScheduleDepartureDto({
        schedule: { ...schedule, operationStatus: 'DEPARTED' },
        deductedItems: [{ itemType: 'SCARF', quantity: 3, remainingQuantity: 17 }],
      }),
    ).toEqual({
      schedule: { ...schedule, operationStatus: 'DEPARTED' },
      deductedItems: [{ itemType: 'SCARF', quantity: 3, remainingQuantity: 17 }],
    });
  });

  it.each([
    [[{ itemType: 'WINE', quantity: 3, remainingQuantity: 17 }]],
    [[{ itemType: 'SCARF', quantity: 3 }]],
    [
      [
        { itemType: 'SCARF', quantity: 1, remainingQuantity: 1 },
        { itemType: 'SCARF', quantity: 1, remainingQuantity: 0 },
      ],
    ],
  ])('rejects malformed deducted items: %j', (deductedItems) => {
    expect(() => decodeScheduleDepartureDto({ schedule, deductedItems })).toThrow(
      ContractMappingError,
    );
  });

  it('decodes a completion', () => {
    expect(
      decodeScheduleCompletionDto({ schedule: { ...schedule, operationStatus: 'COMPLETED' } })
        .schedule.operationStatus,
    ).toBe('COMPLETED');
    expect(() => decodeScheduleCompletionDto({})).toThrow(ContractMappingError);
  });

  it('accepts the v0.3 demo error codes', () => {
    for (const code of [
      'RESERVATION_NOT_MODIFIABLE',
      'SCHEDULE_NOT_CONFIRMED',
      'SCHEDULE_ALREADY_DEPARTED',
      'SCHEDULE_NOT_DEPARTED',
      'INSUFFICIENT_INVENTORY',
    ] as const) {
      expect(decodeApiErrorDto({ code, message: 'Synthetic', fieldErrors: [] }).code).toBe(code);
    }
  });
});
