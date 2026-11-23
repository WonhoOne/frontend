// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createBrowserSpeechSynthesisAdapter,
  estimateSpeechTimeoutMs,
  type BrowserSpeechSynthesis,
  type BrowserSpeechSynthesisUtterance,
} from './browserSpeechSynthesisAdapter';

class Utterance implements BrowserSpeechSynthesisUtterance {
  lang = '';
  rate = 0;
  voice: BrowserSpeechSynthesisUtterance['voice'] = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

function fakeSynthesis() {
  const spoken: BrowserSpeechSynthesisUtterance[] = [];
  const cancel = vi.fn();
  const synthesis: BrowserSpeechSynthesis = {
    speak: (utterance) => {
      spoken.push(utterance);
    },
    cancel,
    getVoices: () => [{ lang: 'en-US' }, { lang: 'ko-KR' }],
  };
  const adapter = createBrowserSpeechSynthesisAdapter({
    getGlobals: () => ({ synthesis, Utterance }),
  });
  return { adapter, cancel, spoken };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('browser speech synthesis adapter', () => {
  it('degrades silently without speechSynthesis and still completes the request', async () => {
    vi.stubGlobal('window', {});
    const { createBrowserSpeechSynthesisAdapter: create } =
      await import('./browserSpeechSynthesisAdapter');
    const adapter = create();
    const onDone = vi.fn();
    expect(adapter.isSupported()).toBe(false);
    expect(() => adapter.speak('안녕하세요', { onDone })).not.toThrow();
    expect(onDone).toHaveBeenCalledOnce();
    expect(() => adapter.cancel()).not.toThrow();
  });

  it('speaks Korean with a Korean voice and completes once on end', () => {
    const { adapter, spoken } = fakeSynthesis();
    const onDone = vi.fn();
    adapter.speak('무슨 기념일인가요?', { lang: 'ko-KR', onDone });
    expect(spoken).toHaveLength(1);
    expect(spoken[0]).toMatchObject({ text: '무슨 기념일인가요?', lang: 'ko-KR', rate: 1 });
    expect(spoken[0]?.voice).toEqual({ lang: 'ko-KR' });
    expect(onDone).not.toHaveBeenCalled();
    spoken[0]?.onend?.();
    spoken[0]?.onerror?.();
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('completes a replaced or cancelled request exactly once', () => {
    const { adapter, cancel, spoken } = fakeSynthesis();
    const first = vi.fn();
    const second = vi.fn();
    adapter.speak('첫 번째', { onDone: first });
    adapter.speak('두 번째', { onDone: second });
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    adapter.cancel();
    expect(cancel).toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    spoken[1]?.onend?.();
    expect(second).toHaveBeenCalledOnce();
  });

  it('times out when the browser never reports the end', () => {
    vi.useFakeTimers();
    const { adapter } = fakeSynthesis();
    const onDone = vi.fn();
    adapter.speak('추가로 필요하신 것 있으세요?', { onDone });
    vi.advanceTimersByTime(estimateSpeechTimeoutMs('추가로 필요하신 것 있으세요?') - 1);
    expect(onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('treats a throwing browser as unavailable', () => {
    const synthesis: BrowserSpeechSynthesis = {
      speak: () => {
        throw new Error('blocked');
      },
      cancel: vi.fn(),
      getVoices: () => [],
    };
    const adapter = createBrowserSpeechSynthesisAdapter({
      getGlobals: () => ({ synthesis, Utterance }),
    });
    const onDone = vi.fn();
    adapter.speak('안녕하세요', { onDone });
    expect(onDone).toHaveBeenCalledOnce();
  });
});
