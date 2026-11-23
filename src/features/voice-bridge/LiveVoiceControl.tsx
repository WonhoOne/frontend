import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useReservationDraft } from '@/features/reservation';
import {
  createBrowserSpeechRecognitionAdapter,
  createBrowserSpeechSynthesisAdapter,
  createVoiceRuntime,
  matchGuidedVoiceUtterance,
  type SpeechRecognitionAdapter,
  type SpeechSynthesisAdapter,
  type VoiceCommand,
  type VoiceRuntime,
  type VoiceTheme,
} from '@/integrations/voice';
import { Button } from '@/shared/ui';
import {
  INITIAL_GUIDED_VOICE_DIALOG_STATE,
  runGuidedVoiceDialogTurn,
  startGuidedVoiceDialog,
  type GuidedVoiceDialogState,
  type GuidedVoiceDialogTurn,
} from './guidedVoiceDialog';
import { createLiveVoiceContext, type LiveVoiceChoices } from './liveVoiceContext';
import { createReservationDraftVoiceCapabilities } from './reservationDraftVoiceAdapter';
import { executeVoiceCommand, type VoiceBridgeResult } from './voiceCommandBridge';
import { markVoicePreparedReservation } from './voiceReservationConfirmation';
import styles from './LiveVoiceControl.module.css';

export interface GuidedVoiceDialogOptions {
  /** Logged-in customer name from the existing auth session; null omits the name. */
  getCustomerName: () => string | null;
}

interface LiveVoiceControlProps {
  getChoices: () => LiveVoiceChoices;
  showTours: (theme?: VoiceTheme) => void;
  onProductSelected: (id: string) => void;
  /** Browser boundary only; production uses the existing Web Speech adapter. */
  createAdapter?: () => SpeechRecognitionAdapter;
  /** Enables the spoken guided dialog in front of the exact grammar. */
  guidedDialog?: GuidedVoiceDialogOptions;
  /** Spoken-reply boundary; production uses the browser speechSynthesis adapter. */
  createSpeaker?: () => SpeechSynthesisAdapter;
}

const RECOGNITION_OPTIONS = { lang: 'ko-KR', interimResults: true } as const;
/** Pause before re-arming the single-utterance browser session in a guided conversation. */
const RELISTEN_DELAY_MS = 150;

/** Runtime은 effect lifetime에 하나. Draft는 Provider만 소유하며 ref는 committed state를 읽는다. */
export function LiveVoiceControl({
  getChoices,
  showTours,
  onProductSelected,
  createAdapter = createBrowserSpeechRecognitionAdapter,
  guidedDialog,
  createSpeaker = createBrowserSpeechSynthesisAdapter,
}: LiveVoiceControlProps) {
  const { draft, dispatch } = useReservationDraft();
  const latest = useRef({
    draft,
    dispatch,
    getChoices,
    showTours,
    onProductSelected,
    guidedDialog,
  });
  useLayoutEffect(() => {
    latest.current = { draft, dispatch, getChoices, showTours, onProductSelected, guidedDialog };
  });
  const runtimeRef = useRef<VoiceRuntime | null>(null);
  const sessionRef = useRef<{ begin: () => void; end: () => void } | null>(null);
  // Dialog progress survives route changes: this control stays mounted across
  // discovery → detail → configure, and only the Provider owns the Draft itself.
  // Start greets once; after a recognition error it resumes. Stop or the closing line resets it.
  const dialogRef = useRef<GuidedVoiceDialogState>(INITIAL_GUIDED_VOICE_DIALOG_STATE);
  const [active, setActive] = useState(false);
  const [conversation, setConversation] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
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
    const speaker = createSpeaker();
    let conversing = false;
    let speaking = false;
    let relistenTimer: ReturnType<typeof setTimeout> | undefined;

    /** The one execution path for exact commands and dialog commands alike. */
    function execute(command: VoiceCommand): VoiceBridgeResult {
      // Browser callbacks can deliver several finals in one turn. Commit the existing
      // Provider before reading the next command; never mirror/reduce Draft locally.
      let executed: VoiceBridgeResult | undefined;
      flushSync(() => {
        executed = executeVoiceCommand(command, {
          ...draftCapabilities,
          ...(removalCapabilities.removeOption
            ? { removeOption: removalCapabilities.removeOption }
            : {}),
          showTours: (theme) => latest.current.showTours(theme),
          selectTheme: (theme) => latest.current.showTours(theme),
        });
      });
      const result: VoiceBridgeResult = executed ?? {
        ok: false,
        command: command.command,
        error: { code: 'CAPABILITY_FAILED' },
      };
      const productId = latest.current.draft.tourProductId;
      if (result.ok && command.command === 'SELECT_TOUR_PRODUCT' && productId !== null) {
        latest.current.onProductSelected(productId);
      }
      if (result.ok && productId !== null) markVoicePreparedReservation(productId);
      setMessage(
        result.ok
          ? 'Choice updated. Review your trip in the form before submitting.'
          : result.error.code === 'INVALID_COMBINATION'
            ? 'The selected transport cannot carry that many participants. No changes were made. Choose a different transport or participant count in the form.'
            : 'This voice choice is unavailable here. Use the form to continue.',
      );
      return result;
    }

    function listen() {
      if (!conversing || speaking) return;
      runtime.start(RECOGNITION_OPTIONS);
    }

    function scheduleListen() {
      if (relistenTimer !== undefined) clearTimeout(relistenTimer);
      relistenTimer = setTimeout(() => {
        relistenTimer = undefined;
        listen();
      }, RELISTEN_DELAY_MS);
    }

    function endConversation() {
      conversing = false;
      if (relistenTimer !== undefined) clearTimeout(relistenTimer);
      relistenTimer = undefined;
      setConversation(false);
    }

    /** Never listen while speaking, so the app cannot hear (and act on) its own reply. */
    function say({ reply: line, closed }: Pick<GuidedVoiceDialogTurn, 'reply' | 'closed'>) {
      setReply(line);
      speaking = true;
      runtime.abort();
      speaker.speak(line, {
        lang: 'ko-KR',
        onDone: () => {
          speaking = false;
          if (closed) {
            endConversation();
            setMessage('Voice guide finished. Review your trip and submit it in the form.');
            return;
          }
          listen();
        },
      });
    }

    const runtime = createVoiceRuntime({
      speechRecognitionAdapter: createAdapter(),
      getInterpretationContext: () => getContext().interpretation,
      interceptFinalTranscript: (heard, context) => {
        if (!latest.current.guidedDialog) return false;
        // Anything captured while a reply is playing is the app hearing itself.
        if (speaking) return true;
        const utterance = matchGuidedVoiceUtterance(heard, context);
        if (utterance === null) return false;
        const turn = runGuidedVoiceDialogTurn(dialogRef.current, utterance, {
          getView: () => ({
            customerName: latest.current.guidedDialog?.getCustomerName() ?? null,
            choices: latest.current.getChoices(),
            draft: latest.current.draft,
          }),
          execute,
        });
        dialogRef.current = turn.state;
        say(turn);
        return true;
      },
    });
    runtimeRef.current = runtime;

    sessionRef.current = {
      begin() {
        const options = latest.current.guidedDialog;
        if (!options) {
          runtime.start(RECOGNITION_OPTIONS);
          return;
        }
        conversing = true;
        setConversation(true);
        if (dialogRef.current.started) {
          listen();
          return;
        }
        const turn = startGuidedVoiceDialog(options.getCustomerName());
        dialogRef.current = turn.state;
        say(turn);
      },
      end() {
        // Stop resets the dialog so the next Start greets again; the Draft is untouched.
        dialogRef.current = INITIAL_GUIDED_VOICE_DIALOG_STATE;
        endConversation();
        speaker.cancel();
        runtime.abort();
      },
    };

    const unsubscribe = runtime.subscribe((event) => {
      switch (event.type) {
        case 'recognition-start':
          setActive(true);
          setMessage('Listening…');
          break;
        case 'transcript':
          setTranscript(event.transcript);
          break;
        case 'command':
          execute(event.command);
          break;
        case 'interpretation-failure':
          setMessage('Voice command not understood. Try again or use the form.');
          break;
        case 'recognition-error':
          setActive(false);
          if (conversing && speaking && event.error.code === 'ABORTED') {
            // Our own pause while a reply plays; the reply re-arms recognition when done.
            break;
          }
          // Any other error ends listening as before (including silence). The dialog keeps its
          // place, so Start voice resumes the conversation without greeting again.
          if (conversing) endConversation();
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
          if (conversing) {
            // The browser session ends after each utterance; keep the conversation listening
            // while the presenter uses the GUI between lines. A reply re-arms it when done.
            if (!speaking) scheduleListen();
            break;
          }
          setMessage((current) =>
            current === 'Listening…' ? 'Voice stopped. Start again or use the form.' : current,
          );
          break;
      }
    });
    return () => {
      runtimeRef.current = null;
      sessionRef.current = null;
      conversing = false;
      if (relistenTimer !== undefined) clearTimeout(relistenTimer);
      speaker.cancel();
      unsubscribe();
      runtime.dispose();
    };
  }, [createAdapter, createSpeaker]);

  function start() {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    setTranscript('');
    setActive(runtime.isSupported());
    sessionRef.current?.begin();
  }

  function stop() {
    sessionRef.current?.end();
  }

  return (
    <section aria-label="Voice trip choices" className={styles.control}>
      <div className={styles.actions}>
        <Button onClick={start} disabled={active || conversation} variant="secondary">
          Start voice
        </Button>
        <Button onClick={stop} disabled={!active && !conversation} variant="secondary">
          Stop voice
        </Button>
      </div>
      <p role="status" aria-live="polite">
        {message}
      </p>
      {reply ? <p aria-label="Voice guide reply">Voice guide: {reply}</p> : null}
      {transcript ? <p>Heard: {transcript}</p> : null}
    </section>
  );
}
