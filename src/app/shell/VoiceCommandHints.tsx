import type { VoiceCommandHint } from './customerVoiceHints';
import styles from './VoiceCommandHints.module.css';

/** Presentation only. Hints are examples; GUI and every Voice command keep working without them. */
export function VoiceCommandHints({ hints }: { hints: readonly VoiceCommandHint[] }) {
  if (hints.length === 0) return null;
  return (
    <section aria-labelledby="voice-command-hints-title" className={styles.hints}>
      <h2 id="voice-command-hints-title" className={styles.title}>
        Try saying
      </h2>
      <ul className={styles.list}>
        {hints.map((hint) => (
          <li key={hint.phrase} className={styles.item}>
            <span lang="ko" className={styles.phrase}>
              “{hint.phrase}”
            </span>
            <span className={styles.description}>{hint.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
