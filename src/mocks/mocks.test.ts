import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { handlers } from '@/mocks/handlers';
import { server } from '@/mocks/server';

describe('MSW shared mock boundary', () => {
  it('registers only the approved public TourProduct collection baseline', async () => {
    expect(handlers).toHaveLength(1);

    const response = await fetch('/api/v1/tours');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
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
    expect(handlers).toHaveLength(1);
  });
});
