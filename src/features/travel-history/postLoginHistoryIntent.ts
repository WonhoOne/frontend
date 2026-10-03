import { useSyncExternalStore } from 'react';

export type PostLoginHistoryIntent = 'show-previous-trips' | 'suppress';

let pendingIntent: PostLoginHistoryIntent | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function setPostLoginHistoryIntent(intent: PostLoginHistoryIntent) {
  pendingIntent = intent;
  emitChange();
}

export function consumePostLoginHistoryIntent(): PostLoginHistoryIntent | null {
  const intent = pendingIntent;
  pendingIntent = null;
  emitChange();
  return intent;
}

export function clearPostLoginHistoryIntent() {
  pendingIntent = null;
  emitChange();
}

export function usePostLoginHistoryIntent() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => pendingIntent,
    () => null,
  );
}
