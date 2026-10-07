export interface AppRuntimeConfig {
  apiBaseUrl: string;
}

export interface RuntimeEnvironment {
  VITE_API_BASE_URL?: string;
}

export class RuntimeConfigError extends Error {
  override readonly name = 'RuntimeConfigError';
}

const DEFAULT_API_BASE_URL = '/api/v1';

function stripTrailingSlashes(value: string) {
  return value.replace(/\/+$/, '');
}

function normalizeRelativeApiBaseUrl(value: string) {
  if (!value.startsWith('/') || value.startsWith('//')) {
    throw new RuntimeConfigError(
      'VITE_API_BASE_URL must be an absolute http(s) URL or a same-origin absolute path.',
    );
  }

  if (value.includes('?') || value.includes('#')) {
    throw new RuntimeConfigError('VITE_API_BASE_URL must not contain query or fragment data.');
  }

  const normalized = stripTrailingSlashes(value);

  if (normalized.length === 0) {
    throw new RuntimeConfigError('VITE_API_BASE_URL must identify an API path.');
  }

  return normalized;
}

function normalizeAbsoluteApiBaseUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new RuntimeConfigError(
      'VITE_API_BASE_URL must be an absolute http(s) URL or a same-origin absolute path.',
    );
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new RuntimeConfigError('VITE_API_BASE_URL only supports http(s) URLs.');
  }

  if (url.username.length > 0 || url.password.length > 0) {
    throw new RuntimeConfigError('VITE_API_BASE_URL must not contain credentials.');
  }

  if (url.search.length > 0 || url.hash.length > 0) {
    throw new RuntimeConfigError('VITE_API_BASE_URL must not contain query or fragment data.');
  }

  return stripTrailingSlashes(url.toString());
}

export function normalizeApiBaseUrl(value: string | undefined) {
  const configuredValue = value ?? DEFAULT_API_BASE_URL;
  const trimmedValue = configuredValue.trim();

  if (trimmedValue.length === 0) {
    throw new RuntimeConfigError('VITE_API_BASE_URL must not be empty when configured.');
  }

  return trimmedValue.startsWith('/')
    ? normalizeRelativeApiBaseUrl(trimmedValue)
    : normalizeAbsoluteApiBaseUrl(trimmedValue);
}

/**
 * Public runtime configuration is read once at the application boundary.
 *
 * SECURITY: VITE_* values are bundled for the browser and must never contain
 * credentials, signing secrets, database access, or provider secrets.
 */
export function createRuntimeConfig(environment: RuntimeEnvironment): AppRuntimeConfig {
  return {
    apiBaseUrl: normalizeApiBaseUrl(environment.VITE_API_BASE_URL),
  };
}

export const runtimeConfig = createRuntimeConfig(import.meta.env);
