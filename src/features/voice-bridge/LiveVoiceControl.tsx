import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useReservationDraft } from '@/features/reservation';
import {
  createBrowserSpeechRecognitionAdapter,
  createVoiceRuntime,
  type SpeechRecognitionAdapter,
  type VoiceRuntime,
  type VoiceTheme,
} from '@/integrations/voice';
import { Button } from '@/shared/ui';
import { createLiveVoiceContext, type LiveVoiceChoices } from './liveVoiceContext';
import { createReservationDraftVoiceCapabilities } from './reservationDraftVoiceAdapter';
import { executeVoiceCommand, type VoiceBridgeResult } from './voiceCommandBridge';
import styles from './LiveVoiceControl.module.css';

interface LiveVoiceControlProps {
  getChoices: () => LiveVoiceChoices;
  showTours: (theme?: VoiceTheme) => void;
  onProductSelected: (id: string) => void;
  /** Browser boundary only; production uses the existing Web Speech adapter. */
  createAdapter?: () => SpeechRecognitionAdapter;
}

/** Runtime은 effect lifetime에 하나. Draft는 Provider만 소유하며 ref는 committed state를 읽는다. */
export function LiveVoiceControl({
  getChoices,
  showTours,
  onProductSelected,
  createAdapter = createBrowserSpeechRecognitionAdapter,
}: LiveVoiceControlProps) {
  const { draft, dispatch } = useReservationDraft();
  const latest = useRef({ draft, dispatch, getChoices, showTours, onProductSelected });
  useLayoutEffect(() => {
    latest.current = { draft, dispatch, getChoices, showTours, onProductSelected };
  });
  const runtimeRef = useRef<VoiceRuntime | null>(null);
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState('Start voice to change your trip choices.');

  useEffect(() => {
    const getContext = (removal = false) =>
      createLiveVoiceContext(latest.current.getChoices(), latest.current.draft, removal);
    const adapterInput = {
      getDraft: () => latest.current.draft,
      getContext: () => getContext().draft,
      dispatch: (action: Parameters<typeof dispatch>[0]) => latest.current.dispatch(action),
    };
    const draftCapabilities = createReservationDraftVoiceCapabilities(adapterInput);
    const removalCapabilities = createReservationDraftVoiceCapabilities({
      ...adapterInput,
      getContext: () => getContext(true).draft,
    });
    const runtime = createVoiceRuntime({
      speechRecognitionAdapter: createAdapter(),
      getInterpretationContext: () => getContext().interpretation,
    });
    runtimeRef.current = runtime;
    const unsubscribe = runtime.subscribe((event) => {
      switch (event.type) {
        case 'recognition-start':
          setActive(true);
          setMessage('Listening…');
          break;
        case 'transcript':
          setTranscript(event.transcript);
          break;
        case 'command': {
          // Browser callbacks can deliver several finals in one turn. Commit the existing
          // Provider before reading the next command; never mirror/reduce Draft locally.
          let result: VoiceBridgeResult | undefined;
          flushSync(() => {
            result = executeVoiceCommand(event.command, {
              ...draftCapabilities,
              ...(removalCapabilities.removeOption
                ? { removeOption: removalCapabilities.removeOption }
                : {}),
              showTours: (theme) => latest.current.showTours(theme),
              selectTheme: (theme) => latest.current.showTours(theme),
            });
          });
          if (
            result?.ok &&
            event.command.command === 'SELECT_TOUR_PRODUCT' &&
            latest.current.draft.tourProductId !== null
          ) {
            latest.current.onProductSelected(latest.current.draft.tourProductId);
          }
          setMessage(
            result?.ok
              ? 'Choice updated. Review your trip in the form before submitting.'
              : 'This voice choice is unavailable here. Use the form to continue.',
          );
          break;
        }
        case 'interpretation-failure':
          setMessage('Voice command not understood. Try again or use the form.');
          break;
        case 'recognition-error':
          setActive(false);
          setMessage(
            event.error.code === 'NOT_SUPPORTED'
              ? 'Voice is unavailable in this browser. Use the form to continue.'
              : 'Voice recognition failed. Check microphone access, try again, or use the form.',
          );
          // Abort releases the browser session on end; restarting cannot add listeners.
          break;
        case 'runtime-error':
          setMessage('Voice context is unavailable. Use the form to continue.');
          break;
        case 'end':
          setActive(false);
          break;
      }
    });
    return () => {
      runtimeRef.current = null;
      unsubscribe();
      runtime.dispose();
    };
  }, [createAdapter]);

  function start() {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    setTranscript('');
    setActive(runtime.isSupported());
    runtime.start({ lang: 'ko-KR', interimResults: true });
  }

  return (
    <section aria-label="Voice trip choices" className={styles.control}>
      <div className={styles.actions}>
        <Button onClick={start} disabled={active} variant="secondary">
          Start voice
        </Button>
        <Button onClick={() => runtimeRef.current?.abort()} disabled={!active} variant="secondary">
          Stop voice
        </Button>
      </div>
      <p role="status" aria-live="polite">
        {message}
      </p>
      {transcript ? <p>Heard: {transcript}</p> : null}
    </section>
  );
}
