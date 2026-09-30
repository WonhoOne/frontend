import { AppErrorBoundary } from '@/app/errors/AppErrorBoundary';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';

/**
 * Root application composition.
 *
 * INVARIANT: Global providers and the Error Boundary wrap the Router. Route
 * composition itself stays in app/router rather than leaking into App.
 */
export function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </AppErrorBoundary>
  );
}
