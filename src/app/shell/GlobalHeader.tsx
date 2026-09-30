import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';

import { routePaths } from '@/app/router/paths';

import styles from '@/app/shell/GlobalHeader.module.css';

const primaryNavigation = [
  { label: 'Tours', compactLabel: 'Tours', to: routePaths.tours },
  { label: 'My Trips', compactLabel: 'Trips', to: routePaths.myTrips },
  { label: 'Login / Account', compactLabel: 'Account', to: routePaths.login },
] as const;

/**
 * 공개 애플리케이션의 전역 navigation chrome이다.
 *
 * CONTRACT: Foundation Header는 navigation만 제공한다.
 * Auth 상태를 추론하거나 Feature data를 조회하지 않는다.
 *
 * Home에서는 hero와 하나의 surface처럼 보이도록 overlay tone을 사용하되,
 * hero 하단을 지나면 다른 route와 같은 warm solid chrome으로 복귀한다.
 */
export function GlobalHeader() {
  const { pathname } = useLocation();
  const isHome = pathname === routePaths.home;
  const [isPastHomeHero, setIsPastHomeHero] = useState(false);

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const syncHomeHeaderTone = () => {
      const homeHero = document.querySelector<HTMLElement>('[data-home-hero]');
      const heroBottom = homeHero?.getBoundingClientRect().bottom;

      setIsPastHomeHero(heroBottom !== undefined && heroBottom <= 64);
    };

    syncHomeHeaderTone();
    window.addEventListener('scroll', syncHomeHeaderTone, { passive: true });
    window.addEventListener('resize', syncHomeHeaderTone);

    return () => {
      window.removeEventListener('scroll', syncHomeHeaderTone);
      window.removeEventListener('resize', syncHomeHeaderTone);
    };
  }, [isHome]);

  const visualTone = isHome && !isPastHomeHero ? 'overlay' : 'solid';
  const rootClasses = [
    styles.root,
    isHome ? styles.home : undefined,
    visualTone === 'overlay' ? styles.overlay : styles.solid,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={rootClasses} data-header-tone={visualTone}>
      <div className={styles.inner}>
        <NavLink className={styles.brand ?? ''} to={routePaths.home}>
          Mister World
        </NavLink>

        <nav aria-label="Primary" className={styles.navigation}>
          {primaryNavigation.map((item) => (
            <NavLink
              aria-label={item.label}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : undefined].filter(Boolean).join(' ')
              }
              key={item.to}
              to={item.to}
            >
              <span aria-hidden="true" className={styles.fullLabel}>
                {item.label}
              </span>
              <span aria-hidden="true" className={styles.compactLabel}>
                {item.compactLabel}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
