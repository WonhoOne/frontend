import { useSyncExternalStore } from 'react';

const DESKTOP_HISTORY_QUERY = '(min-width: 768px)';

function getSnapshot() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }

  return window.matchMedia(DESKTOP_HISTORY_QUERY).matches;
}

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(DESKTOP_HISTORY_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

export function useDesktopHistorySurface() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
