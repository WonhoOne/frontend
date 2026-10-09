# Voice V9 — Browser / Accessibility / Voice GUI QA

## Gate decision

Code/browser QA evidence is recorded below. Final CI results belong to the PR's
exact head commit. **B9-C requires manual device QA** before an unconditional
Voice live integration PASS. Fake recognition is never evidence of microphone
hardware, Korean recognition accuracy, or assistive-technology perceptual quality.

- Repository: WonhoOne/frontend
- Starting main: 02d3e2dd54eda6189aaa69106e28d124962116df (PR #38)
- Final observed remote main: 02d3e2dd54eda6189aaa69106e28d124962116df
- Approved docs/main: c5b763253bb4acd8e4e4c6db0a736be8f1c247fc
- Approved Backend snapshot: 597cf92f1baf93211862d4ea5dbfa8a199b808a2
- Branch: test/voice-browser-a11y-qa-v9
- Date: 2026-10-09 (Asia/Seoul)
- Production changes: none; test-only hardening and this local QA record.
- Requirements: FR-02–06, FR-12, FR-13, BR-28; NFR-06.
- APIs: existing public TourProduct/TourSchedule reads. Voice introduces no API.
- Ownership: Voice component tests remain in the Voice directory. The user
  explicitly requested browser E2E expansion in this V9 task.

## Browser and recognition evidence

All deterministic browser tests use Playwright Chromium and fake recognition.
Both constructors are present in the standard test to prove standard preference;
the prefixed test explicitly removes standard; unsupported removes both.

| Boundary | Evidence |
| --- | --- |
| SpeechRecognition | Standard chosen; prefixed constructor count remains zero |
| webkitSpeechRecognition | Prefixed selected only when standard is absent |
| Neither constructor | Nonmodal unsupported feedback, Draft unchanged, GUI can reach Review |
| NOT_ALLOWED / AUDIO_CAPTURE / NO_SPEECH / NETWORK / ABORTED / UNKNOWN | Per-error browser cases: unchanged Draft, late result ignored, native end, keyboard restart, GUI selection and Review |
| NOT_SUPPORTED | Unsupported browser case plus adapter unit assertions |
| Start / Stop / restart | Enter/Space activation; active Start disabled; asynchronous abort waits for end; next session works |
| StrictMode | Two adapters for replay, one subscription each, first disposed before second; both aborted once by final unmount |
| Unmount / remount | Runtime disposed, old callback cannot mutate Draft, native end detaches handlers, new session works |
| Interim / final | Interim displayed outside live status and cannot execute; final applies GUI change |
| Multiple finals | One native result callback adds Champagne, adds Coffee, removes Champagne in order; the next final sees committed Provider state |
| Duplicate commands | Repeated add/remove does not duplicate Extras; already-selected commands remain idempotent |

The adapter unit suite also covers pending/listening/stopping double starts,
synchronous constructor/start exceptions, native stop/abort exceptions, resultIndex,
multiple alternatives, listener unsubscribe, and stale instance callbacks.
StrictMode counters are adapter/runtime ownership counters; construction of native
recognition remains lazy until Start.

Supported Customer routes deliberately share the existing live composition.
Commands across Home/Tours/Detail/Configure read the current route's public choices.
Exiting the supported surface to Review disposes delivery; a captured pre-exit
callback is ignored even before asynchronous native end. V9 does not redesign
this established lifetime or add another routing state.

## Accessibility and layout evidence

- Named Voice region; real native Start/Stop buttons with appropriate disabled states.
- Tab traversal and Enter/Space activation; Stop reachable; no trap.
- Recognition error/end and successful Draft mutation preserve focus in Participants.
- One polite status region; transcript is separate ordinary text. Interim updates
  do not change Listening status. Repeated identical status text is not appended
  into a growing announcement history.
- 44px minimum width/height and viewport containment measured for both Voice buttons.
- Detail and Configure tested at 320, 390, 768, 1023, 1024, 1280 CSS pixels.
- Additional 640px CSS viewport represents 1280px at 200% zoom; this is viewport
  equivalence, not proof of native browser zoom on every device.
- All layout cases use reduced motion and complete Voice Start/Stop/restart,
  Extras GUI/Voice interaction and existing desktop/mobile Review CTA.
- Existing full browser regression covers mobile summaries, keyboard forms,
  Detail CTA, safe recovery, dialogs and responsive page interactions.

Actual screen-reader announcements and human perceptual quality: **NOT EXECUTED**.
No new announcement queue, animation, or transcript persistence is introduced.

## GUI fallback and parity

- Browser unsupported and every recognition error family preserve GUI selection/Review.
- Existing interpreter/matcher unit tests reject unrecognized, ambiguous and invalid
  arguments. Runtime tests sanitize context failure. Bridge tests cover missing,
  throwing and failing capabilities. Live composition tests preserve Draft/GUI
  for unavailable options and unavailable/invalid schedules.
- SHOW_TOURS and SELECT_THEME use existing router/query; no Draft reset.
- Product selection stores canonical identity and opens existing Detail; invalid
  product does not navigate or mutate.
- Detail Voice Style/Schedule updates native radio state; GUI changes remain in
  Draft when the next Voice choice is applied.
- Configure GUI participant/hotel/transport/meal changes remain committed during
  the next Voice mutation; Voice choices update those GUI controls.
- Extras sequence covers empty → add Champagne/Coffee → GUI edit → remove → empty,
  repeated add/remove, and both same-callback and separate-callback delivery.
- Selected unavailable Extra removal remains allowed; adding unavailable Extra is
  rejected in live component tests.
- Unknown historical Extra is preserved by Voice. Explicit existing GUI recovery
  removes it and re-enables Review; opaque key is not exposed as a selectable option.
- Existing V6-C browser/component tests prove removed Premium Champagne stays
  removed after reload, remount, navigation, same-Style interaction and other commands.

Transport selection retains existing GUI catalog/readiness behavior. V9 does not
add a Voice-only capacity authority; Backend remains responsible for final
configuration/capacity validation. No business rule or readiness logic changes.

## Reservation and privacy

Unsupported intents tested: 예약해줘, 신청해줘, submit, book it, 결제해줘.
Reservation POST count: **0**; no Review/Submit auto-click; existing GUI Review
remains an explicit user action and has no live Voice runtime.

Production Voice source audit found no localStorage/sessionStorage access, fetch,
XMLHttpRequest, sendBeacon, MediaRecorder, analytics, upload, or console logging.
The existing ReservationDraft provider persists canonical choices, not transcripts.
Browser regression additionally proves a distinctive transcript is absent from
both Web Storage areas, interpretation adds no application fetch/XHR requests,
and a new Start clears the displayed transcript.

This audits application behavior. Native browser SpeechRecognition may use a
browser/platform recognition service; no claim of offline recognition or absence
of browser-owned service traffic is made.

## Real microphone QA

- Real microphone QA: **NOT EXECUTED**
- Environment observed: Windows, Codex in-app Chromium-based browser, localhost.
- Unmocked Home Start and Stop controls were exercised.
- Start entered a pending session; no recognition-start/final result or microphone
  prompt was observed through the available browser UI. Stop restored Start.
- Genuine Korean speech, hardware input and service recognition were not available
  as controllable test inputs in this session; no actual phrase is marked PASS.
- Microphone permission allow/deny on a real device: unverified.
- Korean accuracy, latency, repeated native final delivery and mobile differences: unverified.
- Actual assistive-technology listening: unverified.
- Manual device gate: **PENDING**.

Manual device gate should record browser/OS/version, localhost or HTTPS, permission
allow and denial, current real Backend product/schedule choices, genuine Korean
phrases, GUI/Draft outcome, Start/Stop/restart, and network/service failure behavior.
Use the task's recommended product/style/schedule/participant/hotel/transport/meal/
Coffee/Champagne smoke journey. Do not equate fake-recognition E2E with this gate.

## Validation and handoff

Local verification uses Windows Node 24.18.0, below package engines
>=24.21.0 <25; CI uses the repository's Node 24.21.0. The PR must pass the
repository's verify and full Playwright gate, production build, dependency audit,
approved Backend public smoke, and real Spring/MySQL authenticated E2E on its head.
Consult PR checks for exact run URLs and final results.

Regression files:

- src/features/voice-bridge/LiveVoiceControl.test.tsx
- tests/e2e/voice-browser-a11y-v9.spec.ts
- Existing tests/e2e/voice-live-composition.spec.ts and the complete suite remain gates.

Shared Contract changed: NO
Backend API changed: NO
Voice semantics changed: NO
ReservationDraft schema changed: NO
Business Rules changed: NO

B9-C readiness: **MANUAL DEVICE QA REQUIRED** after code/automated gates pass.
Next gate: V9 code/automated PASS + manual device evidence → B9-C Voice Live
Integration Gate → B9-D Cross-Repo E2E.
