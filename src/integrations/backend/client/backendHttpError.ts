export interface BackendResponseMetadata {
  status: number;
  statusText: string;
  headers: Readonly<Record<string, string>>;
}

export class BackendHttpError extends Error {
  override readonly name = 'BackendHttpError';
  readonly kind = 'http' as const;

  constructor(
    readonly response: BackendResponseMetadata,
    readonly body: unknown,
  ) {
    super(`Backend request failed with HTTP ${response.status}.`);
  }
}

export class BackendNetworkError extends Error {
  override readonly name = 'BackendNetworkError';
  readonly kind = 'network' as const;

  constructor(options?: ErrorOptions) {
    super('Backend request failed before an HTTP response was received.', options);
  }
}

export class BackendRequestAbortedError extends Error {
  override readonly name = 'BackendRequestAbortedError';
  readonly kind = 'aborted' as const;

  constructor(options?: ErrorOptions) {
    super('Backend request was aborted.', options);
  }
}

export type BackendMalformedResponseReason = 'non-json-content-type' | 'invalid-json';

export class BackendMalformedResponseError extends Error {
  override readonly name = 'BackendMalformedResponseError';
  readonly kind = 'malformed-response' as const;

  constructor(
    readonly response: BackendResponseMetadata,
    readonly reason: BackendMalformedResponseReason,
    options?: ErrorOptions,
  ) {
    super('Backend returned a response that is not valid JSON.', options);
  }
}
