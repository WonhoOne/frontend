export interface ReservationFieldError {
  field: string;
  code: string;
}

export type ReservationDataError =
  | { kind: 'authentication-required'; code: string }
  | { kind: 'forbidden'; code: string }
  | { kind: 'not-found'; code: 'RESERVATION_NOT_FOUND' }
  | { kind: 'conflict'; code: string; fieldErrors: readonly ReservationFieldError[] }
  | { kind: 'validation'; code: string; fieldErrors: readonly ReservationFieldError[] }
  | { kind: 'network'; requestMayHaveReachedServer?: boolean }
  | { kind: 'server'; code?: string }
  | { kind: 'unknown' };

/**
 * Page가 human-readable message를 parsing하지 않도록 status + stable code + fieldErrors만 받는다.
 * 실제 HTTP error decoding은 IMP-6 Backend adapter의 책임이다.
 */
export class ReservationDataSourceError extends Error {
  readonly detail: ReservationDataError;

  constructor(detail: ReservationDataError) {
    super(detail.kind);
    this.name = 'ReservationDataSourceError';
    this.detail = detail;
  }
}
