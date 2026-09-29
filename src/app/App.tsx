import { AppErrorBoundary } from '@/app/errors/AppErrorBoundary';
import { AppProviders } from '@/app/providers/AppProviders';

/**
 * Root application composition.
 *
 * LIFECYCLE: The router replaces the bootstrap surface in P7. Keeping the
 * temporary surface here avoids inventing Product screens before route
 * foundation exists.
 */
export function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <main id="main-content">
          <h1>Mister World</h1>
          <p>Frontend foundation is running.</p>
        </main>
      </AppProviders>
    </AppErrorBoundary>
  );
}
