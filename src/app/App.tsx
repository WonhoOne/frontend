import { AppErrorBoundary } from '@/app/errors/AppErrorBoundary';
import { AppProviders } from '@/app/providers/AppProviders';
import { PageContainer } from '@/shared/ui';

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
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <main id="main-content" tabIndex={-1}>
          <PageContainer>
            <h1>Mister World</h1>
            <p>Frontend foundation is running.</p>
          </PageContainer>
        </main>
      </AppProviders>
    </AppErrorBoundary>
  );
}
