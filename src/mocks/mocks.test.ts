import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { handlers } from '@/mocks/handlers';
import { server } from '@/mocks/server';

describe('MSW Foundation boundary', () => {
  it('starts with no guessed Product handlers', () => {
    expect(handlers).toHaveLength(0);
  });

  it('supports test-local handlers without changing the shared registry', async () => {
    server.use(
      http.get('https://example.test/foundation-health', () =>
        HttpResponse.text('test-handler-ok'),
      ),
    );

    const response = await fetch('https://example.test/foundation-health');

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('test-handler-ok');
    expect(handlers).toHaveLength(0);
  });
});
