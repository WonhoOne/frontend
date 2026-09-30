import { NavLink } from 'react-router';

import { routePaths } from '@/app/router/paths';

import styles from '@/app/shell/GlobalHeader.module.css';

const primaryNavigation = [
  { label: 'Tours', to: routePaths.tours },
  { label: 'My Trips', to: routePaths.myTrips },
  { label: 'Login / Account', to: routePaths.login },
] as const;

/**
 * Public application navigation chrome.
 *
 * CONTRACT: The Foundation header exposes navigation only. It does not infer
 * Auth state or query Feature data.
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
