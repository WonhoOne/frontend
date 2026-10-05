// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createBrowserSpeechRecognitionAdapter,
  VOICE_COMMAND_NAMES,
  type SpeechRecognitionAdapterEvent,
} from './index';
import {
  type BrowserSpeechRecognition,
  type BrowserSpeechRecognitionResultEvent,
} from './browserSpeechRecognitionAdapter';

class FakeRecognition implements BrowserSpeechRecognition {
  static instances: FakeRecognition[] = [];
  lang = '';
  continuous = true;
  interimResults = true;
  maxAlternatives = 0;
  onstart: BrowserSpeechRecognition['onstart'] = null;
  onresult: BrowserSpeechRecognition['onresult'] = null;
  onerror: BrowserSpeechRecognition['onerror'] = null;
  onend: BrowserSpeechRecognition['onend'] = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    FakeRecognition.instances.push(this);
  }

  result(transcript: string, isFinal: boolean, confidence?: number): void {
    this.onresult?.({
      resultIndex: 0,
      results: [
        {
          isFinal,
          length: 1,
          0: { transcript, ...(confidence === undefined ? {} : { confidence }) },
        },
      ],
    });
  }
}

function session() {
  const adapter = createBrowserSpeechRecognitionAdapter({ getConstructor: () => FakeRecognition });
  const events: SpeechRecognitionAdapterEvent[] = [];
  adapter.subscribe((event) => events.push(event));
  adapter.start();
  const recognition = FakeRecognition.instances[0]!;
  return { adapter, recognition, events };
}

beforeEach(() => {
  FakeRecognition.instances = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('browser detection and configuration', () => {
  it('imports safely without window and emits NOT_SUPPORTED without throwing', async () => {
    vi.stubGlobal('window', undefined);
    const module = await import('./browserSpeechRecognitionAdapter');
    const adapter = module.createBrowserSpeechRecognitionAdapter();
    const listener = vi.fn();
    adapter.subscribe(listener);
    expect(adapter.isSupported()).toBe(false);
    expect(() => adapter.start()).not.toThrow();
    adapter.stop();
    adapter.abort();
    expect(adapter.state).toBe('idle');
    expect(listener).toHaveBeenCalledExactlyOnceWith({
      type: 'error',
      error: { code: 'NOT_SUPPORTED' },
    });
  });

  it.each([{}, { SpeechRecognition: null, webkitSpeechRecognition: false }])(
    'handles a browser with no usable recognition constructors: %j',
    (browser) => {
      vi.stubGlobal('window', browser);
      expect(createBrowserSpeechRecognitionAdapter().isSupported()).toBe(false);
    },
  );

  it('prefers the standard constructor over the prefixed constructor', () => {
    class Prefixed extends FakeRecognition {}
    vi.stubGlobal('window', {
      SpeechRecognition: FakeRecognition,
      webkitSpeechRecognition: Prefixed,
    });
    const adapter = createBrowserSpeechRecognitionAdapter();
    expect(adapter.isSupported()).toBe(true);
    expect(FakeRecognition.instances).toHaveLength(0);
    adapter.start();
    expect(FakeRecognition.instances[0]).toBeInstanceOf(FakeRecognition);
    expect(FakeRecognition.instances[0]).not.toBeInstanceOf(Prefixed);
  });

  it('uses webkitSpeechRecognition when standard recognition is absent', () => {
    vi.stubGlobal('window', { webkitSpeechRecognition: FakeRecognition });
    const adapter = createBrowserSpeechRecognitionAdapter();
    expect(adapter.isSupported()).toBe(true);
    adapter.start();
    expect(FakeRecognition.instances).toHaveLength(1);
  });

  it('sets Voice-local defaults before calling native start', () => {
    class ChecksConfiguration extends FakeRecognition {
      override start = vi.fn(() => {
        expect([this.lang, this.continuous, this.interimResults, this.maxAlternatives]).toEqual([
          'ko-KR',
          false,
          false,
          1,
        ]);
      });
    }
    const adapter = createBrowserSpeechRecognitionAdapter({
      getConstructor: () => ChecksConfiguration,
    });
    adapter.start();
    expect(FakeRecognition.instances[0]!.start).toHaveBeenCalledOnce();
  });

  it('applies overrides and restores defaults for a later session', () => {
    const adapter = createBrowserSpeechRecognitionAdapter({
      getConstructor: () => FakeRecognition,
    });
    adapter.start({ lang: 'en-US', continuous: true, interimResults: true, maxAlternatives: 3 });
    expect(FakeRecognition.instances[0]).toMatchObject({
      lang: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
    });
    FakeRecognition.instances[0]!.onend?.();
    adapter.start();
    expect(FakeRecognition.instances[1]).toMatchObject({
      lang: 'ko-KR',
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
    });
  });
});

describe('session lifecycle', () => {
  it('blocks double starts while pending, listening, and stopping; end allows manual restart', () => {
    const { adapter, recognition, events } = session();
    adapter.start();
    expect(events).toEqual([]);
    recognition.onstart?.();
    expect(adapter.state).toBe('listening');
    expect(events).toEqual([{ type: 'start' }]);
    adapter.start();
    adapter.stop();
    adapter.stop();
    expect(adapter.state).toBe('stopping');
    expect(recognition.stop).toHaveBeenCalledOnce();
    adapter.start();
    recognition.result(' 최종 결과! ', true);
    expect(events.at(-1)).toEqual({
      type: 'transcript',
      result: { transcript: ' 최종 결과! ', isFinal: true },
    });
    const lateResult = recognition.onresult;
    const lateEnd = recognition.onend;
    recognition.onend?.();
    expect(adapter.state).toBe('idle');
    expect(events.at(-1)).toEqual({ type: 'end' });
    expect(recognition.onresult).toBeNull();
    expect(recognition.start).toHaveBeenCalledOnce();
    expect(FakeRecognition.instances).toHaveLength(1);
    adapter.start();
    expect(FakeRecognition.instances).toHaveLength(2);
    const count = events.length;
    lateResult?.({ resultIndex: 0, results: [] });
    lateEnd?.();
    expect(events).toHaveLength(count);
    FakeRecognition.instances[1]!.onstart?.();
    expect(adapter.state).toBe('listening');
  });

  it('stops a pending session without reporting a late start as listening', () => {
    const { adapter, recognition, events } = session();
    adapter.stop();
    recognition.onstart?.();
    expect(adapter.state).toBe('stopping');
    expect(events).toEqual([]);
    recognition.onend?.();
    expect(adapter.state).toBe('idle');
  });

  it('aborts once, suppresses late results, and normalizes browser aborted', () => {
    const { adapter, recognition, events } = session();
    recognition.onstart?.();
    adapter.stop();
    adapter.abort();
    adapter.abort();
    expect(adapter.state).toBe('stopping');
    expect(recognition.abort).toHaveBeenCalledOnce();
    recognition.result('discarded', true);
    recognition.onerror?.({ error: 'aborted' });
    recognition.onend?.();
    expect(events).toEqual([
      { type: 'start' },
      { type: 'error', error: { code: 'ABORTED' } },
      { type: 'end' },
    ]);
    expect(adapter.state).toBe('idle');
  });

  it.each([
    ['not-allowed', 'NOT_ALLOWED'],
    ['service-not-allowed', 'NOT_ALLOWED'],
    ['audio-capture', 'AUDIO_CAPTURE'],
    ['no-speech', 'NO_SPEECH'],
    ['network', 'NETWORK'],
    ['aborted', 'ABORTED'],
    ['unrecognized', 'UNKNOWN'],
  ])('normalizes %s to %s and awaits end before allowing a new session', (native, code) => {
    const { adapter, recognition, events } = session();
    recognition.onerror?.({ error: native });
    expect(events).toEqual([{ type: 'error', error: { code } }]);
    expect(adapter.state).toBe('stopping');
    adapter.start();
    recognition.result('discarded', true);
    expect(FakeRecognition.instances).toHaveLength(1);
    expect(events).toHaveLength(1);
    recognition.onend?.();
    expect(adapter.state).toBe('idle');
    adapter.start();
    expect(FakeRecognition.instances).toHaveLength(2);
  });

  it.each(['constructor', 'start'] as const)(
    'normalizes synchronous %s failures without retaining a session',
    (phase) => {
      class Failing extends FakeRecognition {
        constructor() {
          super();
          if (phase === 'constructor')
            throw new DOMException('sensitive message', 'NotAllowedError');
        }
        override start = vi.fn(() => {
          throw new DOMException('sensitive message', 'NotAllowedError');
        });
      }
      const adapter = createBrowserSpeechRecognitionAdapter({ getConstructor: () => Failing });
      const listener = vi.fn();
      adapter.subscribe(listener);
      expect(() => adapter.start()).not.toThrow();
      expect(listener).toHaveBeenCalledExactlyOnceWith({
        type: 'error',
        error: { code: 'NOT_ALLOWED' },
      });
      expect(adapter.state).toBe('idle');
      adapter.start();
      expect(listener).toHaveBeenCalledTimes(2);
    },
  );

  it.each(['stop', 'abort'] as const)(
    'emits UNKNOWN if native %s throws and handles a subsequent end',
    (method) => {
      const { adapter, recognition, events } = session();
      recognition[method].mockImplementation(() => {
        throw new Error('private native details');
      });
      expect(() => adapter[method]()).not.toThrow();
      expect(events).toEqual([{ type: 'error', error: { code: 'UNKNOWN' } }]);
      recognition.onend?.();
      expect(adapter.state).toBe('idle');
    },
  );
});

describe('transcripts and subscribers', () => {
  it.each([true, false])('preserves raw text and low confidence with isFinal=%s', (isFinal) => {
    const { recognition, events } = session();
    recognition.result('  ＳＨＯＷ Tours! 골프  ', isFinal, 0.01);
    expect(events).toEqual([
      {
        type: 'transcript',
        result: {
          transcript: '  ＳＨＯＷ Tours! 골프  ',
          isFinal,
          confidence: 0.01,
        },
      },
    ]);
  });

  it('emits only changed results and the first alternative, without browser event fields', () => {
    const { recognition, events } = session();
    const native: BrowserSpeechRecognitionResultEvent = {
      resultIndex: 1,
      results: [
        { isFinal: true, length: 1, 0: { transcript: 'previous' } },
        {
          isFinal: false,
          length: 2,
          0: { transcript: 'first', confidence: 0.1 },
          1: { transcript: 'second', confidence: 0.9 },
        },
        { isFinal: true, length: 1, 0: { transcript: 'next' } },
      ],
    };
    recognition.onresult?.(native);
    expect(events).toEqual([
      { type: 'transcript', result: { transcript: 'first', isFinal: false, confidence: 0.1 } },
      { type: 'transcript', result: { transcript: 'next', isFinal: true } },
    ]);
    expect(events[0]).not.toBe(native);
  });

  it('skips empty alternatives and invalid text; omits nonfinite confidence', () => {
    const { recognition, events } = session();
    recognition.onresult?.({ resultIndex: 0, results: [{ isFinal: true, length: 0 }] });
    recognition.onresult?.({
      resultIndex: 0,
      results: [{ isFinal: true, length: 1, 0: { transcript: 42 as unknown as string } }],
    });
    recognition.result('', true, NaN);
    expect(events).toEqual([{ type: 'transcript', result: { transcript: '', isFinal: true } }]);
  });

  it('supports multiple listeners with idempotent unsubscribe and no replay', () => {
    const { adapter, recognition } = session();
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribe = adapter.subscribe(first);
    const unsubscribeSecond = adapter.subscribe(second);
    recognition.onstart?.();
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    unsubscribe();
    unsubscribe();
    recognition.result('raw', true);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledTimes(2);
    unsubscribeSecond();
    recognition.onend?.();
    adapter.subscribe(first);
    expect(first).toHaveBeenCalledOnce();
  });

  it('delivers to other subscribers while surfacing a throwing listener asynchronously', () => {
    const deferred: (() => void)[] = [];
    vi.stubGlobal('queueMicrotask', (callback: () => void) => deferred.push(callback));
    const { adapter, recognition } = session();
    const error = new Error('subscriber bug');
    adapter.subscribe(() => {
      throw error;
    });
    const other = vi.fn();
    adapter.subscribe(other);
    recognition.onstart?.();
    expect(other).toHaveBeenCalledExactlyOnceWith({ type: 'start' });
    expect(adapter.state).toBe('listening');
    expect(deferred).toHaveLength(1);
    expect(deferred[0]).toThrow(error);
  });

  it('stops delivering a result batch when a subscriber aborts', () => {
    const { adapter, recognition, events } = session();
    adapter.subscribe((event) => {
      if (event.type === 'transcript') adapter.abort();
    });
    recognition.onresult?.({
      resultIndex: 0,
      results: [
        { isFinal: true, length: 1, 0: { transcript: 'first' } },
        { isFinal: true, length: 1, 0: { transcript: 'discarded' } },
      ],
    });
    expect(events).toHaveLength(1);
  });

  it('does not call network or persistence APIs and leaves eleven canonical commands unchanged', () => {
    const forbidden = vi.fn(() => {
      throw new Error('forbidden adapter side effect');
    });
    vi.stubGlobal('fetch', forbidden);
    vi.stubGlobal('XMLHttpRequest', forbidden);
    vi.stubGlobal('localStorage', { getItem: forbidden, setItem: forbidden });
    vi.stubGlobal('sessionStorage', { getItem: forbidden, setItem: forbidden });
    vi.stubGlobal('indexedDB', { open: forbidden });
    const { adapter, recognition } = session();
    recognition.onstart?.();
    recognition.result('raw', true, 0.1);
    adapter.stop();
    adapter.abort();
    recognition.onerror?.({ error: 'aborted' });
    recognition.onend?.();
    expect(forbidden).not.toHaveBeenCalled();
    expect(VOICE_COMMAND_NAMES).toHaveLength(11);
  });
});
