import {
  type SpeechRecognitionAdapter,
  type SpeechRecognitionAdapterError,
  type SpeechRecognitionStartOptions,
  type SpeechRecognitionState,
} from './speechRecognitionAdapter';
import { type VoiceCommand } from './voiceCommand';
import {
  interpretVoiceTranscriptWithContext,
  type VoiceInterpretationResult,
} from './voiceCommandInterpreter';
import { type VoiceInterpretationContext } from './voiceInterpretationContext';

export type VoiceInterpretationFailure = Extract<VoiceInterpretationResult, { ok: false }>['error'];

export interface VoiceRuntimeError {
  code: 'CONTEXT_UNAVAILABLE';
}

export type VoiceRuntimeEvent =
  | { type: 'recognition-start' }
  | { type: 'transcript'; transcript: string; isFinal: boolean; confidence?: number }
  | { type: 'command'; normalizedTranscript: string; command: VoiceCommand }
  | {
      type: 'interpretation-failure';
      normalizedTranscript: string;
      error: VoiceInterpretationFailure;
    }
  | { type: 'recognition-error'; error: SpeechRecognitionAdapterError }
  | { type: 'end' }
  | { type: 'runtime-error'; error: VoiceRuntimeError };

export type VoiceRuntimeListener = (event: VoiceRuntimeEvent) => void;

/** Emits command data only. No execution, context mutation, or transcript retention. */
export interface VoiceRuntime {
  readonly state: SpeechRecognitionState;
  isSupported(): boolean;
  start(options?: SpeechRecognitionStartOptions): void;
  stop(): void;
  abort(): void;
  /** No replay. Listener exceptions surface asynchronously, as in the V4 adapter. */
  subscribe(listener: VoiceRuntimeListener): () => void;
  /** Suppress delivery, abort once, detach, then clear listeners; lifecycle calls become no-ops. */
  dispose(): void;
}

export interface CreateVoiceRuntimeOptions {
  /** Dedicated adapter whose session the runtime owns and aborts on disposal. */
  speechRecognitionAdapter: SpeechRecognitionAdapter;
  /** Called for each final transcript, after transcript delivery; never cached. */
  getInterpretationContext: () => VoiceInterpretationContext;
}

export function createVoiceRuntime({
  speechRecognitionAdapter: adapter,
  getInterpretationContext,
}: CreateVoiceRuntimeOptions): VoiceRuntime {
  let disposed = false;
  const listeners = new Set<VoiceRuntimeListener>();

  function emit(event: VoiceRuntimeEvent): void {
    for (const listener of [...listeners]) {
      if (disposed) return;
      if (!listeners.has(listener)) continue;
      try {
        listener(event);
      } catch (error) {
        queueMicrotask(() => {
          throw error;
        });
      }
    }
  }

  const unsubscribeAdapter = adapter.subscribe((event) => {
    if (disposed) return;
    switch (event.type) {
      case 'start':
        emit({ type: 'recognition-start' });
        return;
      case 'error':
        emit({ type: 'recognition-error', error: { code: event.error.code } });
        return;
      case 'end':
        emit({ type: 'end' });
        return;
      case 'transcript': {
        const { transcript, isFinal, confidence } = event.result;
        emit({
          type: 'transcript',
          transcript,
          isFinal,
          ...(confidence === undefined ? {} : { confidence }),
        });
        // A transcript listener may dispose the runtime during delivery.
        if (disposed || !isFinal) return;
        let context: VoiceInterpretationContext;
        try {
          context = getInterpretationContext();
        } catch {
          emit({ type: 'runtime-error', error: { code: 'CONTEXT_UNAVAILABLE' } });
          return;
        }
        if (disposed) return;
        const result = interpretVoiceTranscriptWithContext(transcript, context);
        if (result.ok) {
          emit({
            type: 'command',
            normalizedTranscript: result.normalizedTranscript,
            command: result.command,
          });
        } else {
          emit({
            type: 'interpretation-failure',
            normalizedTranscript: result.normalizedTranscript,
            error: result.error,
          });
        }
      }
    }
  });

  return {
    get state() {
      return adapter.state;
    },
    isSupported: () => adapter.isSupported(),
    start(options) {
      if (!disposed) adapter.start(options);
    },
    stop() {
      if (!disposed) adapter.stop();
    },
    abort() {
      if (!disposed) adapter.abort();
    },
    subscribe(listener) {
      if (!disposed) listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      try {
        // V4 can be pending while state is idle. Its abort is safe even without a session.
        adapter.abort();
      } finally {
        unsubscribeAdapter();
        listeners.clear();
      }
    },
  };
}
