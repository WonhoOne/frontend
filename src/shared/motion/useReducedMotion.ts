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
 * 사용자의 reduced-motion 플랫폼 설정을 React behavior에 연결한다.
 *
 * CONTRACT: 이 Hook은 플랫폼 preference만 노출한다.
 * 표현을 어떻게 단순화할지는 Component가 결정하며 Product behavior는 분기하지 않는다.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
