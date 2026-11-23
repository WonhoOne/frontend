import type { Page } from '@playwright/test';

/**
 * CI has no speakers and headless Chrome may never finish an utterance. Only the native
 * speechSynthesis boundary is replaced: spoken replies end at once (and are recorded), so
 * recognition resumes exactly as it would after a real reply.
 */
export async function installInstantSpeechSynthesis(page: Page) {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak(utterance: { text: string; onend: (() => void) | null }) {
          spoken.push(utterance.text);
          utterance.onend?.();
        },
        cancel() {},
        getVoices: () => [],
      },
    });
    Object.defineProperty(window, 'spokenVoiceReplies', { value: spoken });
  });
}
