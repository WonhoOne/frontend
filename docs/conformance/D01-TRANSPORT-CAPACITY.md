# D-01 — 인원 대비 차량 정원 사전 검사 (frontend#66)

> 상태: **COMPLETE** (계획·구현 같은 PR, DELEGATED DECISION 2026-11-10)
> 담당: 김태우 (Customer Frontend 공통). Voice 사전 거절은 이한결 [#68](https://github.com/WonhoOne/frontend/issues/68).

## 1. 문제 (감사 R-01, 코드로 재확인)

1. 일반 Theme, 인원 4명, `PREMIUM_VAN_10`인 유효한 Draft.
2. Configure에서 차량을 `PRIVATE_LUXURY_CAR_2`로 바꾼다.
3. `getConfigureReadiness()`는 "선택한 옵션이 selectable인가"만 본다. 두 차량은 항상 selectable이므로 `isReady=true`.
4. Review로 넘어가고, 신청을 누른 뒤에야 Backend가 `422 VALIDATION_FAILED / CAPACITY_EXCEEDED`로 거절한다.

같은 결과가 "2인승을 먼저 고른 뒤 인원을 4명으로 늘리는" 순서와, Voice 명령으로 Draft가 바뀐 경우에도 생긴다.
Review에는 `transport-capacity-invalid` 안내 문구가 이미 정의돼 있지만, 이 상태를 만드는 코드가 없었다.

## 2. 규칙 근거 (Shared Contract 변경 없음)

| 출처 (`docs@f49d045`) | 내용 |
| --- | --- |
| `requirements/business-rules.md` BR-20 | 예약 Transport의 capacity는 `participantCount` 이상이어야 한다. 복수 차량 자동 배정은 없다 |
| `api/api-spec-draft.md` Configuration | `PRIVATE_LUXURY_CAR_2` (capacity 2), `PREMIUM_VAN_10` (capacity 10) |
| `api/api-spec-draft.md` Error | `fieldErrors[].code` 에 `CAPACITY_EXCEEDED` |
| `architecture/voice-contract.md` | Backend가 transport capacity의 최종 권한 |

Frontend 검사는 **사용자에게 미리 알려 주는 용도**이고, 최종 판정은 계속 Backend가 한다.

## 3. 설계

### 3.1 공통 함수 — `src/features/reservation/transportCapacity.ts`

Reservation feature에 둔다. 정원은 예약 규칙이고, Configure·Review·Voice가 모두 이미 `@/features/reservation`을 쓰기 때문이다.

```ts
export const TRANSPORT_CAPACITY: Readonly<Record<ReservationTransportOption, number>>;

export type TransportCapacityCheck =
  | { status: 'incomplete' } // 인원이나 차량이 아직 없음, 또는 canonical ID가 아님
  | { status: 'fits'; transportOption; capacity; participantCount }
  | { status: 'exceeded'; transportOption; capacity; participantCount };

export function checkTransportCapacity(candidate: {
  participantCount: number | null;
  transportSelectionKey: string | null;
}): TransportCapacityCheck;
```

- 입력은 "후보" 값이다. Draft를 바꾸기 **전에** 결과를 확인할 수 있다 (Voice #68 요구).
- `incomplete`는 막지 않는다. 작성 중인 부분 상태는 정상이다.
- 선택 키는 Shared v0.2 canonical ID와 같다 (`canonicalReservationCreateIdentityResolver`와 같은 해석). 알 수 없는 키는 `incomplete`로 두고, 이 경우 기존 selectable 검사와 Backend가 처리한다.
- 정원을 넘으면 다른 차량이나 인원으로 **자동 변경하지 않는다**.

### 3.2 Configure

| 항목 | 동작 |
| --- | --- |
| Readiness | `exceeded`이면 issue `transport-capacity` 추가 → Review 버튼 비활성 |
| Transport 그룹 | 그룹 아래에 이유와 해결 방법을 한 번 알린다 (`role="alert"`): "선택한 차량은 최대 N명, 현재 M명" |
| Summary 안내 | Desktop·Mobile 모두 "다른 Transport를 고르거나 인원을 줄이라"는 문구 |
| 옵션 표시 | 두 차량 모두 계속 선택 가능. 인원을 먼저 바꾸는 사용자도 있으므로 옵션을 잠그지 않는다 |

### 3.3 Review

- 복원된 Draft나 Voice로 바뀐 Draft가 정원을 넘으면 validation을 `blocking / transport-capacity-invalid`로 보여 준다.
- 신청 버튼을 잠그고 Configure로 가는 정정 링크를 보여 준다.
- `submitReservation()`도 같은 검사로 요청을 보내지 않는다 (이중 방어).

### 3.4 하지 않는 것

Backend 검증 완화, 새 API, Shared enum·DTO 추가, 자동 차량 변경, Voice 소유 디렉터리 수정, 무관한 리팩터링.

## 4. 테스트

| 수준 | 시나리오 |
| --- | --- |
| Unit `transportCapacity.test.ts` | 4+2인승 exceeded · 4+밴 fits · 2+2인승 fits · 10+밴 fits · 인원/차량 없음 incomplete · 비canonical 키 incomplete |
| Unit `configureReadiness.test.ts` | exceeded → `transport-capacity` issue · 부분 상태에서는 capacity issue 없음 |
| Component `ConfigureDesktop` | 밴 → 2인승 변경 시 차단 · 2인승 선택 후 인원 4명 시 차단 · 고치면 다시 Review 가능 · 안내 문구 |
| Page `ReservationReviewPage` | 정원 초과 Draft → 차단 안내 · 신청 버튼 잠김 · POST 없음 |
| E2E Configure | 실제 화면에서 두 순서 모두 차단, 고치면 Review 진입 |
| 기존 suite | `npm run verify`, `npm run test:e2e`, CI Real Backend + MySQL (Customer·Voice·Employee) 회귀 없음 |

## 5. Voice handoff (#68)

구현 PR 머지 후 #68에 댓글로 남긴다: import 경로 `@/features/reservation`, `CHANGE_TRANSPORT`와 `SET_PARTICIPANT_COUNT`에서 넘길 후보 값, 결과별 처리.

## 6. DELEGATED DECISION (2026-11-10)

| 선택 | 결정 | 이유 |
| --- | --- | --- |
| 함수 위치 | `features/reservation` 공개 API | Configure, Review, Voice가 이미 의존하는 예약 규칙 계층 |
| 정원 초과 시 차량 옵션 | 잠그지 않고 경고 | 인원을 나중에 바꾸는 흐름을 막지 않고, 자동 변경 금지 원칙과 맞음 |
| 알 수 없는 키 | `incomplete` (차단 안 함) | 근거 없는 정원을 만들지 않는다. 최종 판정은 Backend |

## 7. 구현 결과

| 파일 | 변경 |
| --- | --- |
| `src/features/reservation/transportCapacity.ts` | `TRANSPORT_CAPACITY`, `checkTransportCapacity` (공개 API로 export) |
| `src/features/configuration/configureReadiness.ts` | `transport-capacity` issue |
| `src/features/configuration/ConfigureDesktop.tsx`, `ConfigurationOptionGroup.tsx` | Transport 그룹 `selectionNotice` 안내 |
| `src/features/configuration/DesktopTripSummary.tsx`, `MobileTripSummary.tsx` | 정원 초과 안내 문구 |
| `src/pages/reservation-review/ReservationReviewPage.tsx` | `transport-capacity-invalid` 차단, 정정 링크, 제출 이중 방어 |

검증 (로컬, Node 24.21.0): `npm run verify` 122 files / 2,007 tests PASS · `npm run test:e2e` 213/213 PASS.
Real Backend 여정(`tests/f2-mysql`)은 모두 2명 + 2인승이라 정원 안에 있어 영향이 없다. CI에서 다시 확인한다.
