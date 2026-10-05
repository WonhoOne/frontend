// @vitest-environment node
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createVoiceRuntime,
  decodeVoiceCommand,
  VOICE_COMMAND_NAMES,
  type SpeechRecognitionAdapter,
  type SpeechRecognitionAdapterEvent,
  type SpeechRecognitionListener,
  type SpeechRecognitionState,
  type VoiceInterpretationContext,
  type VoiceRuntimeEvent,
} from './index';
import * as interpreter from './voiceCommandInterpreter';

class FakeSpeechRecognitionAdapter implements SpeechRecognitionAdapter {
  state: SpeechRecognitionState = 'idle';
  listeners = new Set<SpeechRecognitionListener>();
  isSupported = vi.fn(() => true);
  start = vi.fn<SpeechRecognitionAdapter['start']>();
  stop = vi.fn(() => {
    this.state = 'stopping';
  });
  abort = vi.fn(() => {
    this.state = 'stopping';
  });
  unsubscribe = vi.fn();
  subscribe = vi.fn((listener: SpeechRecognitionListener) => {
    this.listeners.add(listener);
    return () => {
      this.unsubscribe();
      this.listeners.delete(listener);
    };
  });

  emit(event: SpeechRecognitionAdapterEvent): void {
    if (event.type === 'start') this.state = 'listening';
    if (event.type === 'end') this.state = 'idle';
    for (const listener of [...this.listeners]) listener(event);
  }

  transcript(transcript: string, isFinal = true, confidence?: number): void {
    this.emit({
      type: 'transcript',
      result: { transcript, isFinal, ...(confidence === undefined ? {} : { confidence }) },
    });
  }
}

const empty: VoiceInterpretationContext = { tourProducts: [], tourSchedules: [] };
const product = { id: 201, name: '제주 골프 여행' };
const schedule = {
  id: 501,
  tourProductId: 201,
  startDate: '2026-11-10',
  endDate: '2026-11-14',
};
const choices: VoiceInterpretationContext = {
  tourProducts: [product],
  tourSchedules: [schedule, { ...schedule, id: 601, tourProductId: 202 }],
  selectedTourProductId: 201,
};

function session(context: VoiceInterpretationContext = empty) {
  const adapter = new FakeSpeechRecognitionAdapter();
  const getInterpretationContext = vi.fn(() => context);
  const runtime = createVoiceRuntime({
    speechRecognitionAdapter: adapter,
    getInterpretationContext,
  });
  const events: VoiceRuntimeEvent[] = [];
  runtime.subscribe((event) => events.push(event));
  return { adapter, runtime, events, getInterpretationContext };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('adapter lifecycle and event delegation', () => {
  it('delegates support without creating or starting an adapter', () => {
    const { runtime, adapter } = session();
    expect(runtime.isSupported()).toBe(true);
    adapter.isSupported.mockReturnValue(false);
    expect(runtime.isSupported()).toBe(false);
    expect(adapter.isSupported).toHaveBeenCalledTimes(2);
    expect(adapter.start).not.toHaveBeenCalled();
    expect(adapter.subscribe).toHaveBeenCalledOnce();
  });

  it('passes the exact options object and undefined unchanged', () => {
    const { runtime, adapter } = session();
    const options = { lang: 'en-US', continuous: true, interimResults: true, maxAlternatives: 3 };
    runtime.start(options);
    runtime.start();
    expect(adapter.start.mock.calls).toEqual([[options], [undefined]]);
    expect(adapter.start.mock.calls[0]?.[0]).toBe(options);
  });

  it('reflects adapter state and delegates stop and abort', () => {
    const { runtime, adapter, events, getInterpretationContext } = session();
    expect(runtime.state).toBe('idle');
    adapter.emit({ type: 'start' });
    expect(runtime.state).toBe('listening');
    runtime.stop();
    expect(adapter.stop).toHaveBeenCalledOnce();
    expect(runtime.state).toBe('stopping');
    runtime.abort();
    expect(adapter.abort).toHaveBeenCalledOnce();
    adapter.emit({ type: 'end' });
    expect(runtime.state).toBe('idle');
    expect(events).toEqual([{ type: 'recognition-start' }, { type: 'end' }]);
    expect(getInterpretationContext).not.toHaveBeenCalled();
    expect(adapter.start).not.toHaveBeenCalled();
  });

  it('forwards recognition errors separately and awaits the actual end event', () => {
    const interpret = vi.spyOn(interpreter, 'interpretVoiceTranscriptWithContext');
    const { adapter, events, getInterpretationContext } = session();
    adapter.emit({ type: 'error', error: { code: 'NOT_ALLOWED' } });
    expect(events).toEqual([{ type: 'recognition-error', error: { code: 'NOT_ALLOWED' } }]);
    adapter.emit({ type: 'end' });
    expect(events.at(-1)).toEqual({ type: 'end' });
    expect(interpret).not.toHaveBeenCalled();
    expect(getInterpretationContext).not.toHaveBeenCalled();
  });
});

describe('final-only interpretation', () => {
  it('forwards interim text without invoking context or interpreter', () => {
    const interpret = vi.spyOn(interpreter, 'interpretVoiceTranscriptWithContext');
    const { adapter, events, getInterpretationContext } = session();
    adapter.transcript('골프 테마 선택', false, 0.99);
    expect(events).toEqual([
      {
        type: 'transcript',
        transcript: '골프 테마 선택',
        isFinal: false,
        confidence: 0.99,
      },
    ]);
    expect(interpret).not.toHaveBeenCalled();
    expect(getInterpretationContext).not.toHaveBeenCalled();
  });

  it('emits raw transcript before a canonical static command', () => {
    const { adapter, events } = session();
    adapter.transcript('  골프 테마 선택!  ');
    expect(events).toEqual([
      { type: 'transcript', transcript: '  골프 테마 선택!  ', isFinal: true },
      {
        type: 'command',
        normalizedTranscript: '골프 테마 선택',
        command: {
          version: 1,
          command: 'SELECT_THEME',
          args: { theme: 'GOLF_CHALLENGE' },
        },
      },
    ]);
    const commandEvent = events[1];
    if (commandEvent?.type === 'command')
      expect(decodeVoiceCommand(commandEvent.command).ok).toBe(true);
  });

  it.each([
    ['제주 골프 여행 상품 선택', 'SELECT_TOUR_PRODUCT', { tourProductId: 201 }],
    ['11월 10일 일정 선택', 'SELECT_SCHEDULE', { scheduleId: 501 }],
  ])('resolves current dynamic choices for %s', (text, command, args) => {
    const { adapter, events } = session(choices);
    adapter.transcript(text);
    expect(events[1]).toEqual({
      type: 'command',
      normalizedTranscript: text,
      command: { version: 1, command, args },
    });
  });

  it('looks up changed product IDs and selected product at final time across sessions', () => {
    const { adapter, runtime, events, getInterpretationContext } = session(choices);
    expect(getInterpretationContext).not.toHaveBeenCalled();
    adapter.transcript('제주 골프 여행 상품 선택');
    adapter.emit({ type: 'end' });
    runtime.start();
    getInterpretationContext.mockReturnValue({
      ...choices,
      tourProducts: [{ ...product, id: 202 }],
      selectedTourProductId: 202,
    });
    adapter.transcript('제주 골프 여행 상품 선택');
    adapter.transcript('11월 10일 일정 선택');
    expect(
      events.filter((event) => event.type === 'command').map((event) => event.command),
    ).toEqual([
      { version: 1, command: 'SELECT_TOUR_PRODUCT', args: { tourProductId: 201 } },
      { version: 1, command: 'SELECT_TOUR_PRODUCT', args: { tourProductId: 202 } },
      { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: 601 } },
    ]);
    expect(getInterpretationContext).toHaveBeenCalledTimes(3);
  });

  it('uses context changed by a transcript listener before interpretation', () => {
    const { adapter, runtime, events, getInterpretationContext } = session();
    runtime.subscribe((event) => {
      if (event.type === 'transcript') getInterpretationContext.mockReturnValue(choices);
    });
    adapter.transcript('제주 골프 여행 상품 선택');
    expect(events[1]).toMatchObject({ type: 'command', command: { args: { tourProductId: 201 } } });
  });

  it('does not mutate frozen context', () => {
    const context = Object.freeze({
      tourProducts: Object.freeze([Object.freeze({ ...product })]),
      tourSchedules: Object.freeze([Object.freeze({ ...schedule })]),
      selectedTourProductId: 201,
    });
    const { adapter, events } = session(context);
    const before = JSON.stringify(context);
    adapter.transcript('제주 골프 여행 상품 선택');
    adapter.transcript('11월 10일 일정 선택');
    expect(events.filter((event) => event.type === 'command')).toHaveLength(2);
    expect(JSON.stringify(context)).toBe(before);
  });

  it.each([
    ['', 'EMPTY_TRANSCRIPT'],
    ['오늘 날씨가 좋아', 'UNRECOGNIZED'],
    ['예약해줘', 'UNSUPPORTED_INTENT'],
    ['예약 확정', 'UNSUPPORTED_INTENT'],
    ['submit reservation', 'UNSUPPORTED_INTENT'],
    ['상품 -1 선택', 'INVALID_ARGUMENT'],
    ['인원 11명', 'INVALID_ARGUMENT'],
  ])('preserves explicit failure for %s', (text, code) => {
    const { adapter, events } = session();
    adapter.transcript(text);
    expect(events).toEqual([
      { type: 'transcript', transcript: text, isFinal: true },
      {
        type: 'interpretation-failure',
        normalizedTranscript: text,
        error: { code, message: `Voice interpretation failed: ${code}.` },
      },
    ]);
  });

  it.each([
    {
      text: '제주 골프 여행 상품 선택',
      context: { ...choices, tourProducts: [product, { ...product, id: 202 }] },
    },
    {
      text: '11월 10일 일정 선택',
      context: { ...choices, tourSchedules: [schedule, { ...schedule, id: 502 }] },
    },
  ])('surfaces duplicate-name/date ambiguity for $text', ({ text, context }) => {
    const { adapter, events } = session(context);
    adapter.transcript(text);
    expect(events[1]).toMatchObject({
      type: 'interpretation-failure',
      error: { code: 'AMBIGUOUS' },
    });
    expect(events[1]).not.toHaveProperty('command');
  });

  it('preserves INTERNAL_CONTRACT_MISMATCH without another error taxonomy', () => {
    vi.spyOn(interpreter, 'interpretVoiceTranscriptWithContext').mockReturnValueOnce({
      ok: false,
      normalizedTranscript: 'internal',
      error: { code: 'INTERNAL_CONTRACT_MISMATCH', message: 'contract mismatch' },
    });
    const { adapter, events } = session();
    adapter.transcript('internal');
    expect(events[1]).toEqual({
      type: 'interpretation-failure',
      normalizedTranscript: 'internal',
      error: { code: 'INTERNAL_CONTRACT_MISMATCH', message: 'contract mismatch' },
    });
  });

  it('contains context exceptions, never reuses stale context, and recovers on a later final', () => {
    const interpret = vi.spyOn(interpreter, 'interpretVoiceTranscriptWithContext');
    const { adapter, events, getInterpretationContext } = session(choices);
    adapter.transcript('제주 골프 여행 상품 선택');
    getInterpretationContext.mockImplementationOnce(() => {
      throw new Error('private dependency details');
    });
    expect(() => adapter.transcript('제주 골프 여행 상품 선택')).not.toThrow();
    expect(events.slice(2)).toEqual([
      { type: 'transcript', transcript: '제주 골프 여행 상품 선택', isFinal: true },
      { type: 'runtime-error', error: { code: 'CONTEXT_UNAVAILABLE' } },
    ]);
    expect(interpret).toHaveBeenCalledOnce();
    adapter.transcript('제주 골프 여행 상품 선택');
    expect(events.at(-1)).toMatchObject({
      type: 'command',
      command: { args: { tourProductId: 201 } },
    });
    expect(interpret).toHaveBeenCalledTimes(2);
  });

  it.each([undefined, 0, 0.01, 0.99])(
    'uses confidence %s only as transcript metadata',
    (confidence) => {
      const { adapter, events } = session();
      adapter.transcript('골프 테마 선택', true, confidence);
      expect(events[0]).toEqual({
        type: 'transcript',
        transcript: '골프 테마 선택',
        isFinal: true,
        ...(confidence === undefined ? {} : { confidence }),
      });
      expect(events[1]).toEqual({
        type: 'command',
        normalizedTranscript: '골프 테마 선택',
        command: { version: 1, command: 'SELECT_THEME', args: { theme: 'GOLF_CHALLENGE' } },
      });
    },
  );

  it('interprets each final independently, including repeated text, without merging or deduplication', () => {
    const interpret = vi.spyOn(interpreter, 'interpretVoiceTranscriptWithContext');
    const { adapter, events, getInterpretationContext } = session();
    adapter.emit({ type: 'start' });
    for (const text of ['골프 테마 선택', '골프 테마 선택', '예약해줘', '커피 추가'])
      adapter.transcript(text);
    expect(interpret).toHaveBeenCalledTimes(4);
    expect(getInterpretationContext).toHaveBeenCalledTimes(4);
    expect(events.map((event) => event.type)).toEqual([
      'recognition-start',
      'transcript',
      'command',
      'transcript',
      'command',
      'transcript',
      'interpretation-failure',
      'transcript',
      'command',
    ]);
  });
});

describe('subscriptions and cleanup', () => {
  it('supports multiple listeners, no replay and idempotent unsubscribe', () => {
    const { adapter, runtime } = session();
    adapter.emit({ type: 'start' });
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribe = runtime.subscribe(first);
    runtime.subscribe(second);
    expect(first).not.toHaveBeenCalled();
    adapter.transcript('커피 추가');
    expect(first.mock.calls).toEqual(second.mock.calls);
    expect(first).toHaveBeenCalledTimes(2);
    unsubscribe();
    unsubscribe();
    adapter.emit({ type: 'end' });
    expect(first).toHaveBeenCalledTimes(2);
    expect(second).toHaveBeenCalledTimes(3);
  });

  it('isolates throwing listeners and surfaces their exception asynchronously like V4', () => {
    const deferred: (() => void)[] = [];
    vi.stubGlobal('queueMicrotask', (callback: () => void) => deferred.push(callback));
    const { adapter, runtime } = session();
    const error = new Error('subscriber bug');
    runtime.subscribe(() => {
      throw error;
    });
    const other = vi.fn<(event: VoiceRuntimeEvent) => void>();
    runtime.subscribe(other);
    expect(() => adapter.transcript('커피 추가')).not.toThrow();
    expect(other.mock.calls.map(([event]) => event.type)).toEqual(['transcript', 'command']);
    expect(deferred).toHaveLength(2);
    expect(deferred[0]).toThrow(error);
  });

  it.each(['idle', 'listening', 'stopping'] as const)(
    'disposes in state %s with abort before detach and suppresses synchronous/stale callbacks',
    (state) => {
      const { adapter, runtime, events, getInterpretationContext } = session();
      adapter.state = state;
      const stale = [...adapter.listeners][0]!;
      const order: string[] = [];
      adapter.abort.mockImplementation(() => {
        order.push('abort');
        expect(adapter.listeners.size).toBe(1);
        adapter.emit({ type: 'error', error: { code: 'ABORTED' } });
        adapter.transcript('커피 추가');
        runtime.dispose();
      });
      adapter.unsubscribe.mockImplementation(() => {
        order.push('unsubscribe');
      });
      runtime.dispose();
      runtime.dispose();
      expect(order).toEqual(['abort', 'unsubscribe']);
      expect(adapter.abort).toHaveBeenCalledOnce();
      expect(adapter.unsubscribe).toHaveBeenCalledOnce();
      expect(adapter.listeners.size).toBe(0);
      stale({ type: 'transcript', result: { transcript: '커피 추가', isFinal: true } });
      stale({ type: 'end' });
      runtime.start();
      runtime.stop();
      runtime.abort();
      const lateListener = vi.fn();
      runtime.subscribe(lateListener)();
      expect(adapter.start).not.toHaveBeenCalled();
      expect(adapter.stop).not.toHaveBeenCalled();
      expect(adapter.abort).toHaveBeenCalledOnce();
      expect(events).toEqual([]);
      expect(lateListener).not.toHaveBeenCalled();
      expect(getInterpretationContext).not.toHaveBeenCalled();
    },
  );

  it('aborts a pending start even though the adapter still reports idle', () => {
    const { adapter, runtime } = session();
    runtime.start();
    expect(adapter.state).toBe('idle');
    runtime.dispose();
    expect(adapter.abort).toHaveBeenCalledOnce();
  });

  it('stops delivery and interpretation when a transcript listener disposes', () => {
    const { adapter, runtime, events, getInterpretationContext } = session();
    runtime.subscribe(() => runtime.dispose());
    const other = vi.fn();
    runtime.subscribe(other);
    adapter.transcript('커피 추가');
    expect(events.map((event) => event.type)).toEqual(['transcript']);
    expect(other).not.toHaveBeenCalled();
    expect(getInterpretationContext).not.toHaveBeenCalled();
  });

  it('stops before interpretation if the context provider disposes', () => {
    const interpret = vi.spyOn(interpreter, 'interpretVoiceTranscriptWithContext');
    const { adapter, runtime, events, getInterpretationContext } = session();
    getInterpretationContext.mockImplementation(() => {
      runtime.dispose();
      return empty;
    });
    adapter.transcript('커피 추가');
    expect(events).toHaveLength(1);
    expect(interpret).not.toHaveBeenCalled();
  });
});

describe('Voice integration boundary', () => {
  it('never uses network/storage APIs, logs transcripts, or introduces commands', () => {
    const forbidden = vi.fn(() => {
      throw new Error('forbidden side effect');
    });
    vi.stubGlobal('fetch', forbidden);
    vi.stubGlobal('XMLHttpRequest', forbidden);
    vi.stubGlobal('localStorage', {
      getItem: forbidden,
      setItem: forbidden,
      removeItem: forbidden,
    });
    vi.stubGlobal('sessionStorage', {
      getItem: forbidden,
      setItem: forbidden,
      removeItem: forbidden,
    });
    vi.stubGlobal('indexedDB', { open: forbidden });
    const log = vi.spyOn(console, 'log').mockImplementation(forbidden);
    const { adapter, runtime, events } = session(choices);
    runtime.start();
    adapter.emit({ type: 'start' });
    adapter.transcript('골프 테마 선택', false);
    adapter.transcript('제주 골프 여행 상품 선택', true, 0);
    adapter.transcript('11월 10일 일정 선택');
    adapter.transcript('예약해줘');
    runtime.stop();
    runtime.abort();
    adapter.emit({ type: 'error', error: { code: 'NETWORK' } });
    adapter.emit({ type: 'end' });
    runtime.dispose();
    expect(events.filter((event) => event.type === 'command')).toHaveLength(2);
    expect(forbidden).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    expect(VOICE_COMMAND_NAMES).toHaveLength(11);
    expect(VOICE_COMMAND_NAMES).not.toContain('SUBMIT_RESERVATION');
  });

  it('imports only existing local Voice modules', () => {
    const source = readFileSync(new URL('./voiceRuntime.ts', import.meta.url), 'utf8');
    const imports = [...source.matchAll(/from ['"]([^'"]+)['"]/g)].map((match) => match[1]);
    expect(imports).toEqual([
      './speechRecognitionAdapter',
      './voiceCommand',
      './voiceCommandInterpreter',
      './voiceInterpretationContext',
    ]);
  });
});
