import {
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
  BackendRequestAbortedError,
  type BackendResponseMetadata,
} from '@/integrations/backend/client/backendHttpError';

export type BackendHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface BackendJsonRequest {
  path: string;
  method?: BackendHttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  signal?: AbortSignal;
}

export interface BackendJsonResponse {
  status: number;
  statusText: string;
  headers: Readonly<Record<string, string>>;
  body: unknown;
}

export interface BackendHttpClientOptions {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
}

function buildRequestUrl(baseUrl: string, path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new TypeError('Backend request path must be a same-resource absolute path.');
  }

  return `${baseUrl}${path}`;
}

function responseMetadata(response: Response): BackendResponseMetadata {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  };
}

function isJsonContentType(response: Response) {
  const contentType = response.headers.get('content-type');

  if (contentType === null) {
    return false;
  }

  const [mediaType = ''] = contentType.split(';');

  return (
    mediaType === 'application/json' ||
    (mediaType.startsWith('application/') && mediaType.endsWith('+json'))
  );
}

function isAbortFailure(error: unknown, signal: AbortSignal | undefined) {
  if (signal?.aborted === true) {
    return true;
  }

  return error instanceof DOMException && error.name === 'AbortError';
}

async function readJsonBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();

  if (responseText.length === 0) {
    if (response.ok) {
      throw new BackendMalformedResponseError(responseMetadata(response), 'invalid-json');
    }

    return null;
  }

  if (!isJsonContentType(response)) {
    if (response.ok) {
      throw new BackendMalformedResponseError(responseMetadata(response), 'non-json-content-type');
    }

    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch (error) {
    if (response.ok) {
      throw new BackendMalformedResponseError(responseMetadata(response), 'invalid-json', {
        cause: error,
      });
    }

    return null;
  }
}

/**
 * Backend transport boundary.
 *
 * CONTRACT:
 * - Product meaning and DTO validation do not belong here.
 * - Successful JSON stays unknown until the resource decoder approves it.
 * - AbortSignal is forwarded unchanged to fetch.
 * - Authorization/session policy is intentionally deferred to Session F2.
 */
export class BackendHttpClient {
  private readonly fetchImplementation: typeof fetch;

  constructor(private readonly options: BackendHttpClientOptions) {
    this.fetchImplementation = options.fetchImplementation ?? globalThis.fetch;

    if (this.fetchImplementation === undefined) {
      throw new TypeError('A fetch implementation is required.');
    }
  }

  async requestJson(request: BackendJsonRequest): Promise<BackendJsonResponse> {
    const method = request.method ?? 'GET';
    const headers = new Headers(request.headers);
    headers.set('Accept', 'application/json');

    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (request.body !== undefined) {
      headers.set('Content-Type', 'application/json');
      requestInit.body = JSON.stringify(request.body);
    }

    if (request.signal !== undefined) {
      requestInit.signal = request.signal;
    }

    let response: Response;
    try {
      response = await this.fetchImplementation(
        buildRequestUrl(this.options.baseUrl, request.path),
        requestInit,
      );
    } catch (error) {
      if (isAbortFailure(error, request.signal)) {
        throw new BackendRequestAbortedError({ cause: error });
      }

      throw new BackendNetworkError({ cause: error });
    }

    const metadata = responseMetadata(response);
    const parsedBody = await readJsonBody(response);

    if (!response.ok) {
      throw new BackendHttpError(metadata, parsedBody);
    }

    return {
      ...metadata,
      body: parsedBody,
    };
  }
}
