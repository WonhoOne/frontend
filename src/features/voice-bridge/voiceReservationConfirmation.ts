import { useEffect } from 'react';
import {
  createBrowserSpeechSynthesisAdapter,
  type SpeechSynthesisAdapter,
} from '@/integrations/voice';

/**
 * Session-only marker: "this browser tab changed this product's Draft with Voice".
 * Holds a product identity only (no personal data) and is consumed once by the success page.
 */
export const VOICE_PREPARED_STORAGE_KEY = 'mister-world.voice.prepared-tour-product';

type MarkerStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function sessionStore(): MarkerStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function markVoicePreparedReservation(
  tourProductId: string,
  storage: MarkerStorage | undefined = sessionStore(),
): void {
  try {
    storage?.setItem(VOICE_PREPARED_STORAGE_KEY, tourProductId);
  } catch {
    // Storage can be blocked; the spoken confirmation is optional.
  }
}

/** Returns true once when the marker matches, then clears it so a reload stays silent. */
export function consumeVoicePreparedReservation(
  tourProductId: string,
  storage: MarkerStorage | undefined = sessionStore(),
): boolean {
  try {
    if (storage?.getItem(VOICE_PREPARED_STORAGE_KEY) !== tourProductId) return false;
    storage.removeItem(VOICE_PREPARED_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** "2026-12-24" → "12월24일에 선택하신대로 예약되었습니다. 감사합니다." */
export function createReservationConfirmationLine(startDate: string): string | null {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(startDate);
  if (!match) return null;
  return `${Number(match[1])}월${Number(match[2])}일에 선택하신대로 예약되었습니다. 감사합니다.`;
}

interface VoiceReservationConfirmationInput {
  /** Undefined while the reservation is loading or unavailable. */
  tourProductId: string | undefined;
  startDate: string | undefined;
  createSpeaker?: () => SpeechSynthesisAdapter;
  storage?: MarkerStorage;
}

/**
 * Speaks the reservation confirmation on the success page, only when the reservation's
 * product was prepared with Voice in this browser session. Reads Backend-confirmed data only.
 */
export function useVoiceReservationConfirmation({
  tourProductId,
  startDate,
  createSpeaker = createBrowserSpeechSynthesisAdapter,
  storage,
}: VoiceReservationConfirmationInput): void {
  useEffect(() => {
    if (tourProductId === undefined || startDate === undefined) return;
    const line = createReservationConfirmationLine(startDate);
    if (line === null) return;
    if (!consumeVoicePreparedReservation(tourProductId, storage ?? sessionStore())) return;
    // Not cancelled on cleanup: the marker is already consumed, so a StrictMode re-run stays silent.
    createSpeaker().speak(line, { lang: 'ko-KR' });
  }, [createSpeaker, startDate, storage, tourProductId]);
}
