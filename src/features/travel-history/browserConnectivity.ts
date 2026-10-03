export function isBrowserOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
