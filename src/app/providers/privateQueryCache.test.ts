import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { clearPrivateQueryCache, PRIVATE_QUERY_META_KEY } from '@/app/providers/privateQueryCache';

describe('clearPrivateQueryCache', () => {
  it('removes private queries while preserving public server state', async () => {
    const client = new QueryClient();

    await client.prefetchQuery({
      queryKey: ['public-tour', 'tour-a'],
      queryFn: () => ({ name: 'Public Tour' }),
    });
    await client.prefetchQuery({
      queryKey: ['customer-resource'],
      queryFn: () => ({ private: true }),
      meta: { privacy: PRIVATE_QUERY_META_KEY },
    });

    clearPrivateQueryCache(client);

    expect(client.getQueryData(['customer-resource'])).toBeUndefined();
    expect(client.getQueryData(['public-tour', 'tour-a'])).toEqual({
      name: 'Public Tour',
    });
  });
});
