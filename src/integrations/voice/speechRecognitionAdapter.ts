export interface SpeechRecognitionStartOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export type SpeechRecognitionState = 'idle' | 'listening' | 'stopping';

export interface SpeechRecognitionTranscriptEvent {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

export interface SpeechRecognitionAdapterError {
  code:
    | 'NOT_SUPPORTED'
    | 'NOT_ALLOWED'
    | 'AUDIO_CAPTURE'
    | 'NO_SPEECH'
    | 'NETWORK'
    | 'ABORTED'
    | 'UNKNOWN';
}

export type SpeechRecognitionAdapterEvent =
  | { type: 'start' }
  | { type: 'transcript'; result: SpeechRecognitionTranscriptEvent }
  | { type: 'end' }
  | { type: 'error'; error: SpeechRecognitionAdapterError };

export type SpeechRecognitionListener = (event: SpeechRecognitionAdapterEvent) => void;

/** Voice-local runtime boundary; emits raw text without interpreting or executing it. */
export interface SpeechRecognitionAdapter {
  readonly state: SpeechRecognitionState;
  isSupported(): boolean;
  /** A start request is ignored while another session is pending, listening, or stopping. */
  start(options?: SpeechRecognitionStartOptions): void;
  stop(): void;
  abort(): void;
  subscribe(listener: SpeechRecognitionListener): () => void;
}
