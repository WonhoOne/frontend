// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import {
  createVoiceRuntime,
  type SpeechRecognitionAdapter,
  type SpeechRecognitionListener,
  type VoiceInterpretationContext,
  type VoiceRuntimeEvent,
} from './index';

function setup(intercept: (transcript: string, context: VoiceInterpretationContext) => boolean) {
  const listeners = new Set<SpeechRecognitionListener>();
  const adapter: SpeechRecognitionAdapter = {
    state: 'idle',
    isSupported: () => true,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  const context: VoiceInterpretationContext = { tourProducts: [], tourSchedules: [] };
  const runtime = createVoiceRuntime({
    speechRecognitionAdapter: adapter,
    getInterpretationContext: () => context,
    interceptFinalTranscript: intercept,
  });
  const events: VoiceRuntimeEvent['type'][] = [];
  runtime.subscribe((event) => events.push(event.type));
  const say = (transcript: string, isFinal = true) => {
    for (const listener of listeners) {
      listener({ type: 'transcript', result: { transcript, isFinal } });
    }
  };
  return { say, events, context };
}

describe('voice runtime guided-dialog hook', () => {
  it('consumes a final transcript before interpretation when the hook claims it', () => {
    const intercept = vi.fn(() => true);
    const { say, events, context } = setup(intercept);
    say('멋진 여행 상품 추천해주세요');
    expect(intercept).toHaveBeenCalledWith('멋진 여행 상품 추천해주세요', context);
    // No UNSUPPORTED interpretation failure: the dialog layer answered first.
    expect(events).toEqual(['transcript']);
  });

  it('falls through to the unchanged exact grammar otherwise', () => {
    const { say, events } = setup(() => false);
    say('상품 보여줘');
    say('추천해줘');
    expect(events).toEqual(['transcript', 'command', 'transcript', 'interpretation-failure']);
  });

  it('never runs the hook for interim transcripts', () => {
    const intercept = vi.fn(() => true);
    const { say } = setup(intercept);
    say('추천', false);
    expect(intercept).not.toHaveBeenCalled();
  });

  it('reports a failing hook as a runtime error without executing anything', () => {
    const { say, events } = setup(() => {
      throw new Error('dialog failed');
    });
    say('상품 보여줘');
    expect(events).toEqual(['transcript', 'runtime-error']);
  });
});
