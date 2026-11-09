import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/f2-mysql',
  timeout: 45_000,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
  },
  // ORDER: Customer/Voice specs assert the seeded one-product catalog. The Employee spec
  // creates products, so it depends on them and runs last against the same database.
  projects: [
    { name: 'customer', testIgnore: /(employee|nfr-response-time)\.spec\.ts$/ },
    { name: 'employee', testMatch: /employee\.spec\.ts$/, dependencies: ['customer'] },
    // NFR-05 measurement runs last, after every journey has written data. Read-only.
    { name: 'nfr', testMatch: /nfr-response-time\.spec\.ts$/, dependencies: ['employee'] },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: false,
  },
});
