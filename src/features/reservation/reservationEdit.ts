import { createSharedContractConfigureScenario } from '@/features/configuration/sharedContractConfiguration';
import { allowedStylesForTheme, tourStyleLabel } from '@/features/employee-tours/productFormRules';
import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import type {
  ReservationConfigurationModel,
  ReservationExtraOption,
  ReservationHotelOption,
  ReservationMealOption,
  ReservationTheme,
  ReservationTourStyle,
  ReservationTransportOption,
} from '@/features/reservation/reservation.model';
import {
  extraOptions,
  hotelOptions,
  mealOptions,
  transportOptions,
} from '@/integrations/backend/contracts';

/*
 * v0.3 demo: 예약 configuration 변경 규칙.
 *
 * CONTRACT: 화면이 미리 막는 사본일 뿐 최종 판단은 Backend(409/422)가 한다.
 * 가격은 Frontend가 계산하지 않는다. 저장 후 Backend가 돌려준 값을 보여준다.
 */

/** Theme별 허용 Style. 직원 상품 화면과 같은 BR-17/BR-21 규칙을 그대로 쓴다. */
export function allowedStylesForReservation(
  theme: ReservationTheme,
): readonly ReservationTourStyle[] {
  return allowedStylesForTheme(theme);
}

export function reservationStyleLabel(style: ReservationTourStyle): string {
  return tourStyleLabel(style);
}

/** 브라우저 현지 날짜를 `YYYY-MM-DD`로 만든다. UTC로 바꾸면 자정 근처에서 하루가 어긋난다. */
export function localIsoDate(now: Date = new Date()): string {
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 시작일이 오늘보다 뒤일 때만 바꿀 수 있다 (contract §1 409 `RESERVATION_NOT_MODIFIABLE`).
 * 출발·완료 처리 여부는 Customer 응답에 없으므로 Backend 409가 마지막으로 판단한다.
 */
export function isReservationModifiable(startDate: string, today: string): boolean {
  return startDate > today;
}

interface EditOption<T extends string> {
  value: T;
  label: string;
}

const scenarioLabels = new Map(
  createSharedContractConfigureScenario().groups.flatMap((group) =>
    group.options.map((option) => [option.selectionKey, option.title] as const),
  ),
);

function toOptions<T extends string>(values: readonly T[]): readonly EditOption<T>[] {
  return values.map((value) => ({ value, label: scenarioLabels.get(value) ?? value }));
}

/** Configure 화면과 같은 Shared Contract 표시 이름을 쓴다. */
export const reservationEditOptions = {
  hotel: toOptions<ReservationHotelOption>(hotelOptions),
  transport: toOptions<ReservationTransportOption>(transportOptions),
  meal: toOptions<ReservationMealOption>(mealOptions),
  extras: toOptions<ReservationExtraOption>(extraOptions),
} as const;

export function reservationOptionLabel(value: string): string {
  return scenarioLabels.get(value) ?? value;
}

export function isSameReservationConfiguration(
  a: ReservationConfigurationModel,
  b: ReservationConfigurationModel,
): boolean {
  return (
    a.style === b.style &&
    a.hotelOption === b.hotelOption &&
    a.transportOption === b.transportOption &&
    a.mealOption === b.mealOption &&
    a.extraOptions.length === b.extraOptions.length &&
    a.extraOptions.every((extra) => b.extraOptions.includes(extra))
  );
}

export type ReservationEditField = 'style' | 'transport' | 'extras';

export interface ReservationEditFailure {
  message: string;
  fieldMessages: Partial<Record<ReservationEditField, string>>;
  /** 더 이상 바꿀 수 없다 (409 `RESERVATION_NOT_MODIFIABLE`). */
  closed: boolean;
  /** 저장 결과를 모른다. 다시 읽어 확인해야 한다. */
  needsRefresh: boolean;
}

function failure(
  message: string,
  options: Partial<Omit<ReservationEditFailure, 'message'>> = {},
): ReservationEditFailure {
  return {
    message,
    fieldMessages: options.fieldMessages ?? {},
    closed: options.closed ?? false,
    needsRefresh: options.needsRefresh ?? false,
  };
}

/** 저장 실패를 사용자 문구로 바꾼다. Backend message text로 분기하지 않고 code만 본다. */
export function presentReservationEditFailure(
  error: unknown,
  participantCount: number,
): ReservationEditFailure {
  if (!(error instanceof ReservationDataSourceError)) {
    return failure('The service returned an unexpected response. Refresh to see your trip.', {
      needsRefresh: true,
    });
  }

  const detail = error.detail;

  switch (detail.kind) {
    case 'conflict':
      return detail.code === 'RESERVATION_NOT_MODIFIABLE'
        ? failure(
            'This trip can no longer be changed. Changes close once the departure date arrives or the trip has started.',
            { closed: true, needsRefresh: true },
          )
        : failure('This trip could not be changed right now. Refresh and try again.', {
            needsRefresh: true,
          });
    case 'validation': {
      const fieldMessages: Partial<Record<ReservationEditField, string>> = {};

      for (const fieldError of detail.fieldErrors) {
        if (fieldError.field === 'configuration.style') {
          fieldMessages.style = 'This style is not offered for this tour.';
        } else if (fieldError.field === 'configuration.transportOption') {
          fieldMessages.transport = `This transport cannot seat ${participantCount} travellers.`;
        } else if (fieldError.field === 'configuration.extraOptions') {
          fieldMessages.extras = 'Each extra can be selected only once.';
        }
      }

      return failure('Some selections were not accepted. Review the highlighted choices.', {
        fieldMessages,
      });
    }
    case 'authentication-required':
      return failure('Your session has ended. Sign in again to change this trip.');
    case 'forbidden':
    case 'not-found':
      return failure('This reservation is unavailable or cannot be changed.');
    case 'network':
      return failure(
        'We could not confirm whether your change was saved. Refresh to see the latest trip.',
        { needsRefresh: true },
      );
    case 'server':
    case 'unknown':
      return failure('Your change could not be saved. Please try again in a moment.');
  }
}
