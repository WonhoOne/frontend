import {
  type SpeechSynthesisAdapter,
  type SpeechSynthesisSpeakOptions,
} from './speechSynthesisAdapter';

/** Minimal structural browser types, confined to this integration (no global declarations). */
export interface BrowserSpeechSynthesisUtterance {
  text: string;
  lang: string;
  rate: number;
  voice: BrowserSpeechSynthesisVoice | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

export interface BrowserSpeechSynthesisVoice {
  readonly lang: string;
}

export interface BrowserSpeechSynthesis {
  speak(utterance: BrowserSpeechSynthesisUtterance): void;
  cancel(): void;
  getVoices(): readonly BrowserSpeechSynthesisVoice[];
}

export type BrowserSpeechSynthesisUtteranceConstructor = new (
  text: string,
) => BrowserSpeechSynthesisUtterance;

export interface BrowserSpeechSynthesisGlobals {
  synthesis: BrowserSpeechSynthesis;
  Utterance: BrowserSpeechSynthesisUtteranceConstructor;
}

function getBrowserSynthesis(): BrowserSpeechSynthesisGlobals | undefined {
  if (typeof window === 'undefined') return undefined;
  const browser = window as unknown as {
    speechSynthesis?: BrowserSpeechSynthesis;
    SpeechSynthesisUtterance?: BrowserSpeechSynthesisUtteranceConstructor;
  };
  if (
    typeof browser.speechSynthesis?.speak !== 'function' ||
    typeof browser.SpeechSynthesisUtterance !== 'function'
  ) {
    return undefined;
  }
  return { synthesis: browser.speechSynthesis, Utterance: browser.SpeechSynthesisUtterance };
}

/** Browsers occasionally never fire onend; a length-based ceiling keeps the dialog moving. */
export function estimateSpeechTimeoutMs(text: string): number {
  return 3000 + text.length * 250;
}

export class BrowserSpeechSynthesisAdapter implements SpeechSynthesisAdapter {
  private finishCurrent: (() => void) | undefined;
  private readonly getGlobals: () => BrowserSpeechSynthesisGlobals | undefined;

  constructor(getGlobals = getBrowserSynthesis) {
    this.getGlobals = getGlobals;
  }

  isSupported(): boolean {
    return this.getGlobals() !== undefined;
  }

  speak(text: string, { lang = 'ko-KR', onDone }: SpeechSynthesisSpeakOptions = {}): void {
    // A newer reply always wins; the replaced request still completes exactly once.
    this.finishCurrent?.();
    let done = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (done) return;
      done = true;
      if (timer !== undefined) clearTimeout(timer);
      if (this.finishCurrent === finish) this.finishCurrent = undefined;
      onDone?.();
    };

    const globals = this.getGlobals();
    if (!globals || text.trim().length === 0) {
      finish();
      return;
    }
    try {
      const { synthesis, Utterance } = globals;
      const utterance = new Utterance(text);
      utterance.lang = lang;
      utterance.rate = 1;
      const prefix = lang.slice(0, 2).toLowerCase();
      utterance.voice =
        synthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ?? null;
      utterance.onend = finish;
      utterance.onerror = finish;
      this.finishCurrent = finish;
      timer = setTimeout(finish, estimateSpeechTimeoutMs(text));
      synthesis.cancel();
      synthesis.speak(utterance);
    } catch {
      // Spoken replies are an enhancement; the on-screen text remains the source of truth.
      finish();
    }
  }

  cancel(): void {
    const finish = this.finishCurrent;
    this.finishCurrent = undefined;
    try {
      this.getGlobals()?.synthesis.cancel();
    } catch {
      // Ignore browser failures; the request is completed below.
    }
    finish?.();
  }
}

/** Ordinary callers need no browser types. Injection is for deterministic, speaker-free tests. */
export function createBrowserSpeechSynthesisAdapter(
  options: { getGlobals?: () => BrowserSpeechSynthesisGlobals | undefined } = {},
): SpeechSynthesisAdapter {
  return new BrowserSpeechSynthesisAdapter(options.getGlobals);
}
