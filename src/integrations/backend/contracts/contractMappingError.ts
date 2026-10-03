export type BackendContractName =
  'ApiError' | 'TourProduct' | 'TourProduct[]' | 'TourSchedule' | 'TourSchedule[]';

export type ContractMappingFailureReason =
  | 'expected-object'
  | 'expected-array'
  | 'expected-string'
  | 'expected-boolean'
  | 'expected-positive-integer'
  | 'expected-non-negative-integer'
  | 'unknown-enum'
  | 'duplicate-value'
  | 'invalid-date'
  | 'invalid-date-range'
  | 'invalid-money'
  | 'inconsistent-style-prices';

/**
 * Indicates that an HTTP response was received but does not satisfy the
 * approved Shared Contract.
 *
 * SECURITY: Raw response payloads are deliberately not stored on this error.
 * UI and telemetry must not accidentally expose malformed backend content.
 */
export class ContractMappingError extends Error {
  override readonly name = 'ContractMappingError';

  constructor(
    readonly contract: BackendContractName,
    readonly path: string,
    readonly reason: ContractMappingFailureReason,
  ) {
    super(`Backend contract mapping failed for ${contract} at ${path}: ${reason}.`);
  }
}
