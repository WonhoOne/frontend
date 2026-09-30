import { AppErrorBoundary } from '@/app/errors/AppErrorBoundary';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';

/**
 * 애플리케이션 최상위 조합 지점이다.
 *
 * INVARIANT: 전역 Provider와 Error Boundary가 Router 바깥을 감싼다.
 * Route 조합 책임은 App으로 새지 않고 app/router에 남아야 한다.
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
