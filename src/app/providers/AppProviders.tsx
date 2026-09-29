import type { PropsWithChildren } from 'react';

import { QueryProvider } from '@/app/providers/QueryProvider';

/**
 * Makes global provider order visible in one place.
 *
 * INVARIANT: Feature-local state must not be promoted here merely for
 * convenience. New providers need an application-wide lifecycle reason.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return <QueryProvider>{children}</QueryProvider>;
}
