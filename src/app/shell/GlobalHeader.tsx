import { NavLink } from 'react-router';

import { routePaths } from '@/app/router/paths';

import styles from '@/app/shell/GlobalHeader.module.css';

const primaryNavigation = [
  { label: 'Tours', to: routePaths.tours },
  { label: 'My Trips', to: routePaths.myTrips },
  { label: 'Login / Account', to: routePaths.login },
] as const;

/**
 * 공개 애플리케이션의 전역 navigation chrome이다.
 *
 * CONTRACT: Foundation Header는 navigation만 제공한다.
 * Auth 상태를 추론하거나 Feature data를 조회하지 않는다.
 */
export function GlobalHeader() {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <NavLink className={styles.brand ?? ''} to={routePaths.home}>
          Mister World
        </NavLink>

        <nav aria-label="Primary" className={styles.navigation}>
          {primaryNavigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : undefined].filter(Boolean).join(' ')
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
