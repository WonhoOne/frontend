import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SpeechSynthesisAdapter } from '@/integrations/voice';
import {
  consumeVoicePreparedReservation,
  createReservationConfirmationLine,
  markVoicePreparedReservation,
  useVoiceReservationConfirmation,
  VOICE_PREPARED_STORAGE_KEY,
} from './voiceReservationConfirmation';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

function Probe(props: Parameters<typeof useVoiceReservationConfirmation>[0]) {
  useVoiceReservationConfirmation(props);
  return null;
}

describe('voice reservation confirmation', () => {
  it('formats the spoken line from the schedule start date', () => {
    expect(createReservationConfirmationLine('2026-12-24')).toBe(
      '12월24일에 선택하신대로 예약되었습니다. 감사합니다.',
    );
    expect(createReservationConfirmationLine('2027-01-05')).toBe(
      '1월5일에 선택하신대로 예약되었습니다. 감사합니다.',
    );
    expect(createReservationConfirmationLine('not a date')).toBeNull();
  });

  it('consumes the marker once and only for the same product', () => {
    const storage = memoryStorage();
    markVoicePreparedReservation('201', storage);
    expect(storage.getItem(VOICE_PREPARED_STORAGE_KEY)).toBe('201');
    expect(consumeVoicePreparedReservation('999', storage)).toBe(false);
    expect(consumeVoicePreparedReservation('201', storage)).toBe(true);
    expect(consumeVoicePreparedReservation('201', storage)).toBe(false);
  });

  it('speaks once on the success page only when prepared with voice', () => {
    const speak = vi.fn<SpeechSynthesisAdapter['speak']>();
    const createSpeaker = () => ({ isSupported: () => true, speak, cancel: vi.fn() });
    const storage = memoryStorage();

    render(
      <Probe
        tourProductId="201"
        startDate="2026-12-24"
        createSpeaker={createSpeaker}
        storage={storage}
      />,
    );
    expect(speak).not.toHaveBeenCalled();

    markVoicePreparedReservation('201', storage);
    render(
      <StrictMode>
        <Probe
          tourProductId={undefined}
          startDate={undefined}
          createSpeaker={createSpeaker}
          storage={storage}
        />
        <Probe
          tourProductId="201"
          startDate="2026-12-24"
          createSpeaker={createSpeaker}
          storage={storage}
        />
      </StrictMode>,
    );
    expect(speak).toHaveBeenCalledExactlyOnceWith(
      '12월24일에 선택하신대로 예약되었습니다. 감사합니다.',
      { lang: 'ko-KR' },
    );
  });
});
