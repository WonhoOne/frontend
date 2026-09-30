import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getSnapshot() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribe(onPreferenceChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

  mediaQuery.addEventListener('change', onPreferenceChange);

  return () => {
    mediaQuery.removeEventListener('change', onPreferenceChange);
  };
}

/**
 * Subscribes React behavior to the user's reduced-motion preference.
 *
 * CONTRACT: This hook exposes only the platform preference. Components decide
 * how to simplify presentation; Product behavior must not branch on it.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
