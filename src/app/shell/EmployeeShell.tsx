import { NavLink, useNavigate } from 'react-router';

import { employeeRoutePaths } from '@/app/router/paths';
import styles from '@/app/shell/EmployeeShell.module.css';
import { isEmployeeSession, useAuth } from '@/features/auth';
import { Button } from '@/shared/ui';

/** 로그인 화면이 sign-out 요청을 받았음을 알리는 navigation state다. */
export interface EmployeeSignOutNavigationState {
  employeeSignOut: true;
}

const navItems = [
  { label: '여행상품', to: employeeRoutePaths.tours },
  { label: '재고 관리', to: employeeRoutePaths.inventory },
] as const;

/**
 * Employee Console의 상단 bar다 (E00, CP2-B §3).
 *
 * CONTRACT: 직원 session일 때만 그린다. Customer header, 이전 여행 팝업, Voice는
 * 이 shell에 절대 들어오지 않는다 (CP0-A F-A02).
 *
 * LIFECYCLE: 로그아웃은 먼저 로그인 화면으로 이동한 뒤 그 화면에서 session을 비운다.
 * WHY: 편집 중인 화면의 unsaved-changes guard가 이동을 막을 수 있어야 하므로,
 * session을 먼저 지우면 확인 없이 입력이 사라진다 (CP6-F §3).
 */
export function EmployeeShell() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!isEmployeeSession(auth.state)) {
    return null;
  }

  const signOutState: EmployeeSignOutNavigationState = { employeeSignOut: true };

  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <p className={styles.brand}>
          <span className={styles.wordmark}>Mister World</span>
          <span className={styles.context}>직원</span>
        </p>

        <nav aria-label="직원 메뉴" className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.account}>
          <span className={styles.name} title={auth.state.user.name}>
            {auth.state.user.name}
          </span>
          <Button
            onClick={() =>
              void navigate(employeeRoutePaths.login, { replace: true, state: signOutState })
            }
            size="small"
            variant="quiet"
          >
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
