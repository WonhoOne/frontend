import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const DEFAULT_BACKEND_DEV_PROXY_TARGET = 'http://127.0.0.1:8080';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, '.', '');
  const backendProxyTarget =
    environment.BACKEND_DEV_PROXY_TARGET || DEFAULT_BACKEND_DEV_PROXY_TARGET;

  return {
    // public/ contains only the MSW development worker. Never deploy it.
    publicDir: mode === 'production' ? false : 'public',
    plugins: [react()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      proxy: {
        '/api': {
          target: backendProxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
