export interface SpeechSynthesisSpeakOptions {
  lang?: string;
  /**
   * Called exactly once per speak request: when the utterance ends, fails, is replaced or
   * cancelled, times out, or immediately when speech output is unavailable.
   */
  onDone?: () => void;
}

/** Voice-local spoken-reply boundary. Speaks text only; never reads or changes app state. */
export interface SpeechSynthesisAdapter {
  isSupported(): boolean;
  /** Replaces any utterance still speaking. Degrades to an immediate onDone when unsupported. */
  speak(text: string, options?: SpeechSynthesisSpeakOptions): void;
  cancel(): void;
}
