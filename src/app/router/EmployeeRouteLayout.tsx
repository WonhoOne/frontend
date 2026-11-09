import { RouteMotionBoundary } from '@/app/router/RouteMotionBoundary';
import { RouteRuntime } from '@/app/router/RouteRuntime';
import styles from '@/app/router/EmployeeRouteLayout.module.css';
import { EmployeeShell } from '@/app/shell/EmployeeShell';

/**
 * `/employee/*` 전체의 layout이다 (CP7 A-1, A-2).
 *
 * CONTRACT: Customer `AppRouteLayout`과 형제 route로 두어 Customer chrome
 * (GlobalHeader, TransactionHeader, 이전 여행 팝업, Voice)을 절대 mount하지 않는다.
 * focus/scroll runtime, skip link, main landmark, route motion은 Customer와 같은
 * 구현을 재사용한다.
 */
export function EmployeeRouteLayout() {
  return (
    <>
      <RouteRuntime />

      <a className="skip-link" href="#main-content">
        본문으로 건너뛰기
      </a>

      <EmployeeShell />

      <main className={styles.main} id="main-content" tabIndex={-1}>
        <RouteMotionBoundary />
      </main>
    </>
  );
}
