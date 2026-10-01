export type PostLoginHistoryIntent = 'show-previous-trips' | 'suppress';

let pendingIntent: PostLoginHistoryIntent | null = null;

export function setPostLoginHistoryIntent(intent: PostLoginHistoryIntent) {
  pendingIntent = intent;
}

export function consumePostLoginHistoryIntent(): PostLoginHistoryIntent | null {
  const intent = pendingIntent;
  pendingIntent = null;
  return intent;
}

export function clearPostLoginHistoryIntent() {
  pendingIntent = null;
}
