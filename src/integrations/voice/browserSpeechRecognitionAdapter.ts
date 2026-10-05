import {
  type SpeechRecognitionAdapter,
  type SpeechRecognitionAdapterError,
  type SpeechRecognitionAdapterEvent,
  type SpeechRecognitionListener,
  type SpeechRecognitionStartOptions,
  type SpeechRecognitionState,
} from './speechRecognitionAdapter';

/** Minimal structural browser types, confined to this integration (no global declarations). */
export interface BrowserSpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: { readonly transcript: string; readonly confidence?: number };
}

export interface BrowserSpeechRecognitionResultEvent {
  readonly resultIndex: number;
  readonly results: {
    readonly length: number;
    readonly [index: number]: BrowserSpeechRecognitionResult;
  };
}

export interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { readonly error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getBrowserConstructor(): BrowserSpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const browser = window as unknown as {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };
  if (typeof browser.SpeechRecognition === 'function') return browser.SpeechRecognition;
  if (typeof browser.webkitSpeechRecognition === 'function') return browser.webkitSpeechRecognition;
  return undefined;
}

function errorCode(error: string): SpeechRecognitionAdapterError['code'] {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
    case 'NotAllowedError':
    case 'SecurityError':
      return 'NOT_ALLOWED';
    case 'audio-capture':
      return 'AUDIO_CAPTURE';
    case 'no-speech':
      return 'NO_SPEECH';
    case 'network':
    case 'NetworkError':
      return 'NETWORK';
    case 'aborted':
    case 'AbortError':
      return 'ABORTED';
    default:
      return 'UNKNOWN';
  }
}

export class BrowserSpeechRecognitionAdapter implements SpeechRecognitionAdapter {
  private currentState: SpeechRecognitionState = 'idle';
  private recognition: BrowserSpeechRecognition | undefined;
  private discardResults = false;
  private readonly listeners = new Set<SpeechRecognitionListener>();
  private readonly getConstructor: () => BrowserSpeechRecognitionConstructor | undefined;

  constructor(getConstructor = getBrowserConstructor) {
    this.getConstructor = getConstructor;
  }

  get state(): SpeechRecognitionState {
    return this.currentState;
  }

  isSupported(): boolean {
    return this.getConstructor() !== undefined;
  }

  start(options: SpeechRecognitionStartOptions = {}): void {
    // The instance also guards the pending interval before the browser's onstart event.
    if (this.recognition) return;
    try {
      const Constructor = this.getConstructor();
      if (!Constructor) {
        this.emit({ type: 'error', error: { code: 'NOT_SUPPORTED' } });
        return;
      }
      const recognition = new Constructor();
      this.recognition = recognition;
      this.discardResults = false;
      recognition.lang = options.lang ?? 'ko-KR';
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = options.interimResults ?? false;
      recognition.maxAlternatives = options.maxAlternatives ?? 1;
      recognition.onstart = () => {
        if (this.recognition !== recognition || this.currentState === 'stopping') return;
        this.currentState = 'listening';
        this.emit({ type: 'start' });
      };
      recognition.onresult = (event) => {
        if (this.recognition !== recognition || this.discardResults) return;
        // Earlier results are cumulative; emit only those changed in this browser event.
        for (let index = event.resultIndex; index < event.results.length; index++) {
          const result = event.results[index];
          const alternative = result?.[0];
          if (!result || !alternative || typeof alternative.transcript !== 'string') continue;
          this.emit({
            type: 'transcript',
            result: {
              transcript: alternative.transcript,
              isFinal: result.isFinal,
              ...(typeof alternative.confidence === 'number' &&
              Number.isFinite(alternative.confidence)
                ? { confidence: alternative.confidence }
                : {}),
            },
          });
          // A subscriber may abort or end the session during delivery.
          if (this.recognition !== recognition || this.discardResults) break;
        }
      };
      recognition.onerror = (event) => {
        if (this.recognition !== recognition) return;
        // Await onend before permitting another session; late results are discarded.
        this.currentState = 'stopping';
        this.discardResults = true;
        this.emit({ type: 'error', error: { code: errorCode(event.error) } });
      };
      recognition.onend = () => {
        if (this.recognition !== recognition) return;
        this.release();
        this.emit({ type: 'end' });
      };
      recognition.start();
    } catch (error) {
      this.release();
      this.emitException(error);
    }
  }

  stop(): void {
    if (!this.recognition || this.currentState === 'stopping') return;
    this.currentState = 'stopping';
    try {
      this.recognition.stop();
    } catch (error) {
      this.emitException(error);
    }
  }

  abort(): void {
    if (!this.recognition || this.discardResults) return;
    this.currentState = 'stopping';
    this.discardResults = true;
    try {
      this.recognition.abort();
    } catch (error) {
      this.emitException(error);
    }
  }

  subscribe(listener: SpeechRecognitionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private release(): void {
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
    }
    this.recognition = undefined;
    this.currentState = 'idle';
    this.discardResults = false;
  }

  private emitException(error: unknown): void {
    this.emit({
      type: 'error',
      error: { code: errorCode(error instanceof Error ? error.name : '') },
    });
  }

  private emit(event: SpeechRecognitionAdapterEvent): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(event);
      } catch (error) {
        // Preserve visibility of programming errors without interrupting other subscribers.
        queueMicrotask(() => {
          throw error;
        });
      }
    }
  }
}

/** Ordinary callers need no browser types. Injection is for deterministic, microphone-free tests. */
export function createBrowserSpeechRecognitionAdapter(
  options: { getConstructor?: () => BrowserSpeechRecognitionConstructor | undefined } = {},
): SpeechRecognitionAdapter {
  return new BrowserSpeechRecognitionAdapter(options.getConstructor);
}
