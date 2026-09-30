import { Component, type PropsWithChildren, type ReactNode } from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

const initialState: AppErrorBoundaryState = {
  hasError: false,
};

/**
 * 예상하지 못한 React render/runtime 실패를 마지막으로 포착한다.
 *
 * CONTRACT: 요청 실패나 예상 가능한 Product 오류는 여기서 처리하지 않는다.
 * 해당 오류는 요청을 소유한 Feature/Query 상태가 처리한다.
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
