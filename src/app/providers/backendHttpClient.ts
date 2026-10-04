import { runtimeConfig } from '@/app/config/runtimeConfig';
import { BackendHttpClient } from '@/integrations/backend/client/backendClient';

export const backendHttpClient = new BackendHttpClient({
  baseUrl: runtimeConfig.apiBaseUrl,
});
