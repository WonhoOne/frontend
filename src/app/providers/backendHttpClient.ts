import { runtimeConfig } from '@/app/config/runtimeConfig';
import { authSessionStore } from '@/app/providers/authSession';
import { BackendHttpClient } from '@/integrations/backend/client/backendClient';

export const backendHttpClient = new BackendHttpClient({
  baseUrl: runtimeConfig.apiBaseUrl,
  accessTokenProvider: () => authSessionStore.getAccessToken(),
  onPrivateUnauthorized: () => authSessionStore.clear(),
});
