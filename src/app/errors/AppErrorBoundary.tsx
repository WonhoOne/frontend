import { Component, type PropsWithChildren, type ReactNode } from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

const initialState: AppErrorBoundaryState = {
  hasError: false,
};

/**
 * Last-resort boundary for unexpected React render/runtime failures.
 *
 * CONTRACT: Request failures and expected Product errors are not handled here;
 * those belong to the feature/query state that owns the request.
 */
export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  override state = initialState;

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main role="alert">
          <h1>Application unavailable</h1>
          <p>An unexpected error occurred. Refresh the page to try again.</p>
        </main>
      );
    }

    return this.props.children;
  }
}
