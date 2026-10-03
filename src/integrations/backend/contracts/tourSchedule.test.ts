import { describe, expect, it } from 'vitest';

import { decodeTourScheduleDto, decodeTourScheduleListDto } from '@/integrations/backend/contracts';

const validSchedule = {
  id: 501,
  tourId: 201,
  startDate: '2026-11-10',
  endDate: '2026-11-14',
  reservable: true,
  recruitment: {
    unit: 'PARTICIPANT',
    currentCount: 2,
    requiredCount: 3,
    confirmed: false,
  },
};

describe('TourSchedule runtime contract', () => {
  it('decodes the approved v0.2 representation', () => {
    expect(decodeTourScheduleDto(validSchedule)).toEqual(validSchedule);
  });

  it.each([
    ['invalid id', { ...validSchedule, id: -1 }, '$.id', 'expected-positive-integer'],
    ['invalid tourId', { ...validSchedule, tourId: 0 }, '$.tourId', 'expected-positive-integer'],
    [
      'wrong reservable type',
      { ...validSchedule, reservable: 'true' },
      '$.reservable',
      'expected-boolean',
    ],
    [
      'unknown recruitment unit',
      { ...validSchedule, recruitment: { ...validSchedule.recruitment, unit: 'PERSON' } },
      '$.recruitment.unit',
      'unknown-enum',
    ],
    [
      'negative currentCount',
      { ...validSchedule, recruitment: { ...validSchedule.recruitment, currentCount: -1 } },
      '$.recruitment.currentCount',
      'expected-non-negative-integer',
    ],
    [
      'nonpositive requiredCount',
      { ...validSchedule, recruitment: { ...validSchedule.recruitment, requiredCount: 0 } },
      '$.recruitment.requiredCount',
      'expected-positive-integer',
    ],
    [
      'wrong confirmed type',
      { ...validSchedule, recruitment: { ...validSchedule.recruitment, confirmed: 1 } },
      '$.recruitment.confirmed',
      'expected-boolean',
    ],
  ] as const)('rejects %s', (_name, payload, path, reason) => {
    expect(() => decodeTourScheduleDto(payload)).toThrowError(
      expect.objectContaining({ path, reason }),
    );
  });

  it.each(['2026-02-30', '2026-13-01', '2026-1-01', 'not-a-date'])(
    'rejects invalid ISO calendar date %s',
    (startDate) => {
      expect(() => decodeTourScheduleDto({ ...validSchedule, startDate })).toThrowError(
        expect.objectContaining({
          path: '$.startDate',
          reason: 'invalid-date',
        }),
      );
    },
  );

  it('rejects startDate after endDate without deriving reservability', () => {
    expect(() =>
      decodeTourScheduleDto({
        ...validSchedule,
        startDate: '2026-11-15',
        endDate: '2026-11-14',
      }),
    ).toThrowError(expect.objectContaining({ reason: 'invalid-date-range' }));

    expect(
      decodeTourScheduleDto({
        ...validSchedule,
        startDate: '2026-10-01',
        endDate: '2026-10-01',
        reservable: false,
        recruitment: {
          unit: 'COUPLE_TEAM',
          currentCount: 0,
          requiredCount: 99,
          confirmed: true,
        },
      }),
    ).toMatchObject({
      reservable: false,
      recruitment: {
        unit: 'COUPLE_TEAM',
        currentCount: 0,
        requiredCount: 99,
        confirmed: true,
      },
    });
  });

  it('decodes plain-array collections and preserves Backend ordering', () => {
    const second = { ...validSchedule, id: 502, startDate: '2026-12-01', endDate: '2026-12-05' };

    expect(decodeTourScheduleListDto([validSchedule, second])).toEqual([validSchedule, second]);
  });
});
