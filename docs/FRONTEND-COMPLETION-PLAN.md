# Frontend Completion Plan — Definition of Done & Execution Schedule

> Status: **ACTIVE — 현재 Frontend 완료 기준과 남은 작업 순서의 단일 기준 문서**
> Created: 2026-11-09 (Asia/Seoul)
> Owner: 김태우 (Frontend). 실행 위임: Owner가 2026-11-09 Claude Code agent에게 전체 진행을 위임함 (§5)
> Base snapshots at creation:
>
> ```text
> frontend/main  fa84f4b578a3969213bfc851d5b4fa8121ead66d
> docs/main      f49d0457498e8b775f659a27e0c3a96d288d0ba0  (Baseline v0.2, B9 closeout)
> backend/main   597cf92f1baf93211862d4ea5dbfa8a199b808a2
> ```
>
> Course deadlines (CP0-C에서 확인): **2026-11-23 최종 보고서 + 소스 제출**, **2026-11-24 UML/구현 시연**.

---

## 1. 이 문서의 역할

이 문서는 다음 두 질문에 답한다.

1. **Frontend는 언제 "완료"인가?** — §3 Definition of Done
2. **남은 일을 어떤 순서와 일정으로 하는가?** — §4 Workstreams, §7 Ledger

이 문서는 다음을 대체하지 않는다.

| 문서 | 계속 담당하는 것 |
| --- | --- |
| `WonhoOne/docs/main` | Shared requirements, business rules, REST contract, ownership (최상위 SSOT) |
| [`AGENTS.md`](../AGENTS.md) | Frontend 개발 규칙, Voice 디렉터리 소유 경계 |
| [`implementation/IMPLEMENTATION-MASTER-PLAN.md`](implementation/IMPLEMENTATION-MASTER-PLAN.md) | Customer 구현 아키텍처·코드 기준 (§7 Human-Readable Code, §8 Comment, §44 Performance 등) |
| [`employee-console/00-PLANNING-PROGRAM.md`](employee-console/00-PLANNING-PROGRAM.md) | Employee CP0–CP11 절차와 각 CP의 output gate |
| [`employee-console/01-PROGRESS-AND-HANDOFF.md`](employee-console/01-PROGRESS-AND-HANDOFF.md) | Employee CP 단위의 상세 진행 기록 |

충돌 시 우선순위는 Master Plan §2와 Employee Program §H를 따른다. 이 문서는 **완료 기준과 일정**만 정한다.

---

## 2. 현재 상태 (2026-11-09 확인)

| 영역 | 상태 | 근거 |
| --- | --- | --- |
| Customer GUI S01–S11 | ✅ 구현 + 실제 Backend 연동 | PR #8–#12, PR-06/07/08 커밋, #18, #26, #37, #42 |
| AI Voice (이한결 소유 범위) | ✅ B9-C FINAL PASS | #19–#25, #28, #38–#41, docs `B9-INTEGRATION-CLOSEOUT.md` |
| B9 통합 Gate | ✅ FINAL PASS | docs/main `f49d045` |
| `npm run verify` | ✅ PASS — 108 files / 1,887 tests (2026-11-09 로컬 재실행) | typecheck, lint, format, unit, build |
| CI (E2E + Real Backend smoke + Real Backend/MySQL 고객 여정) | ✅ PASS | run `38355772127` (main과 동일 코드, 2026-10-13) |
| Employee Console 기획 | 🟡 P0 merged; CP0-A~CP2-A는 stacked PR #46–#51 (미머지); CP2-B 이후 미착수 | `employee-console/01-PROGRESS-AND-HANDOFF.md` (#51 branch) |
| Employee Console 코드 | ❌ 없음 | route/page/DataSource 0 |
| Backend Employee API | ✅ 존재 (5 endpoints + EmployeeBootstrap, 기본 비활성) | CP0-B audit (#47) |

Customer 쪽에서 Master Plan 자체 기준 대비 남은 항목:

- 단일 JS chunk 564.76 kB (Master Plan §44: route lazy splitting, >500 kB 경고 원인 조사 요구)
- 150줄 이상 + 설명 주석 거의 없는 non-Voice 파일 다수 (Master Plan §8 Comment Standard). 예: `ReservationReviewPage.tsx` 501줄 / 주석 0
- NFR-01/04/05 정량 근거 미기록 (B9 closeout도 "NFR 정량 인증 주장 안 함"으로 명시)

---

## 3. Definition of Done — Frontend 전체

Frontend는 아래 **D-A, D-B, D-C가 모두 충족될 때 완료**다. 각 항목은 **증거(커밋, PR, CI run, 문서)** 가 있어야 체크한다. Chat 답변만으로 체크하지 않는다.

### D-A. Customer GUI + Voice

| ID | 기준 | 현재 |
| --- | --- | --- |
| D-A1 | S01–S11 모든 route가 실제 Backend로 동작 | ✅ |
| D-A2 | Customer critical journey가 CI의 Real Backend + MySQL에서 PASS | ✅ |
| D-A3 | Voice B9-C/B9-D PASS, Voice가 Reservation을 자동 제출하지 않음 | ✅ |
| D-A4 | Route lazy splitting 적용, production build에 >500 kB chunk 경고 없음 (또는 원인과 수용 사유 문서화) | ✅ W4 PR — Page 단위 `React.lazy` + `Suspense` (layout/header는 즉시), 최대 chunk 287 kB, 경고 없음 |
| D-A5 | Master Plan §8 기준: 150줄 이상 non-Voice Page/Feature 파일에 WHY/CONTRACT/INVARIANT 중심 한국어 설명 주석 | ⬜ |
| D-A7 | 공용 `TextLink` 대비 3.9:1 → 4.5:1 이상 (E-PR5에서 발견, Customer 화면 영향) | ✅ W4 PR — `--mw-accent-text` (#7A5C33, 밝은 배경 전부 ≥ 4.86:1)를 TextLink와 accent 글자색 17곳에 적용 |
| D-A6 | NFR-04/05 Frontend 관점 측정 결과 기록 (통합 시나리오 성공 수, 주요 요청 응답시간). NFR-01은 Voice 소유자 근거를 링크 | ⬜ |

Voice 디렉터리(`src/integrations/voice`, `src/features/voice-bridge`)는 이한결 소유 범위이므로 D-A5 주석 보강 대상에서 제외한다.

### D-B. Employee Console (FR-10, FR-11, NFR-02/03/06)

| ID | 기준 | 현재 |
| --- | --- | --- |
| D-B1 | Employee CP0–CP11이 각 output gate를 통과하고 main에 머지됨 | ✅ #45–#56 |
| D-B2 | Employee 로그인 + 역할 구분: EMPLOYEE는 Employee 영역에 진입, CUSTOMER/비로그인은 차단, 401/403 복구 | ✅ E-PR1 (#57) |
| D-B3 | TourProduct 목록 / 생성 / 수정: Theme별 허용 Style 전체의 KRW 가격, 409 `TOUR_PRODUCT_THEME_LOCKED` 처리 | ✅ E-PR2 + E-PR3 (real Backend 409 포함) |
| D-B4 | Inventory 조회 + 양수 수량 추가: 추가는 delta, 불확실한 POST 결과에서 자동 재시도 없음 | ✅ E-PR4 |
| D-B5 | Employee 화면이 Customer 전용 부작용(Customer header, Voice, Previous Trips)을 띄우지 않음 | ✅ E-PR1 (#57) |
| D-B6 | Unit/Component 테스트 + Mock/Real parity + CI의 Real Backend/MySQL Employee 여정 PASS | ✅ EJ01–EJ10 mock 10/10, EJ01–EJ06 real 6/6 |
| D-B7 | CP0-C에서 결정한 지원 범위(PC 전용)의 키보드/포커스/줌 접근성 확인 | ✅ CP9 A1–A13, L1–L4 (E-PR5) |

### D-C. 제출 기준선 (Release / Submission)

| ID | 기준 | 현재 |
| --- | --- | --- |
| D-C1 | 최종 SHA에서 `npm ci`, `npm run verify`, `npm run test:e2e`, `npm run build`, `npm audit --omit=dev --audit-level=high` PASS | ⬜ |
| D-C2 | CI Real Backend smoke + Customer 여정 + Employee 여정 PASS | ⬜ |
| D-C3 | Production mock 차단 검사 PASS (`scripts/assert-production-mock-safety.mjs`) | ⬜ |
| D-C4 | Release metadata 기록 (Master Plan §46: Frontend/docs/Backend SHA, Node, 범위, 열린 gate, 알려진 S2/S3) | ⬜ |
| D-C5 | 문서 정합성: Master Plan 상태, Employee ledger, 이 문서 §7이 실제 상태와 일치 | ⬜ |
| D-C6 | 시연 시나리오 확정: Customer + Voice + Employee, 시연 환경과 계정 준비 체크리스트 | ⬜ |
| D-C7 | Release severity: S0 = 0, S1 = 0 (Master Plan §41) | ⬜ |

최종 보고서와 발표 자료 자체는 팀 산출물이며 이 저장소의 완료 기준이 아니다. 이 저장소는 D-C4, D-C6을 통해 보고서에 들어갈 근거를 제공한다.

---

## 4. Workstreams & Schedule

일정은 14일 안에 끝내기 위한 목표다. 기존 작업 방식(§6)은 그대로 유지하고, 하루에 여러 CP 단위를 순서대로 처리해 속도를 맞춘다.

| WS | 기간 (목표) | 내용 | 완료 조건 |
| --- | --- | --- | --- |
| **W0 Baseline** | 11/09 | 이 문서 머지, 오래된 상태 문구에 현재 문서 링크 추가, 처리 완료된 이슈 정리 | 이 문서가 main에 있음 |
| **W1 Employee 기획 체인 정리** | 11/09–11/10 | Stacked PR #46 → #51 순서대로 리뷰, base를 main으로 바꿔 머지. CP0-C(PC 전용)와 CP1-B IA 결정, CP2-A 근거 범위를 위임 결정으로 기록 | CP0–CP2-A가 main에 있고 ledger가 최신 |
| **W2 Employee 기획 완료** | 11/10–11/13 | Program §G 묶음대로 진행: P1-2 (CP2-B–CP5), P1-3 (CP6-0–CP6-F), P1-4 (CP6-G/H/I), P1-5 (CP7–CP11) | CP11 Final Audit PASS, 구현 PR 순서 확정 (D-B1) |
| **W3 Employee 구현** | 11/14–11/19 | CP11-B가 확정한 PR 순서대로 구현. 예상 단위: 인증·역할·Employee shell → TourProduct 목록 → 생성/수정 → Inventory → Real Backend E2E + CI job | D-B2 – D-B7 |
| **W4 Customer 마무리** | 11/19–11/20 | Route lazy splitting, 설명 주석 보강 (Voice 제외), NFR 측정 기록 | D-A4 – D-A6 |
| **W5 Release & Freeze** | 11/21–11/22 | 최종 SHA 전체 gate, release metadata, 문서 정합성, 시연 시나리오 | D-C1 – D-C7 |
| Buffer | 11/23 | 제출 당일 여유 | — |

W3 PR 단위는 예상이며, 실제 순서는 CP11-B 산출물이 최종 결정한다.

---

## 5. 위임 실행 규칙

Owner(김태우)가 2026-11-09에 전체 진행을 Claude Code agent에게 위임했다. 위임 범위는 다음과 같다.

**Agent가 결정하고 기록하는 것**

- Employee Program에서 `FRONTEND PROPOSAL` 또는 Owner 결정이 필요한 Frontend UX/IA/구현 선택
- PR 리뷰와 머지 (CI가 PASS하는 PR만, stacked PR은 순서대로 base를 main으로 바꾼 뒤)
- 기록 방식: Employee ledger와 해당 CP 문서에 `DELEGATED DECISION (2026-MM-DD)` 라벨, 선택지와 이유를 남긴다

**Agent가 멈추고 Owner에게 묻는 것**

- Shared contract의 빈틈이나 변경이 필요할 때 (docs repo 변경)
- Backend 변경이 필요할 때
- 비밀값, 실제 계정 비밀번호, 외부 유료 서비스가 필요할 때
- FR 범위를 줄여야 할 때
- Voice 소유 디렉터리 변경이 필요할 때 (이한결 범위)

---

## 6. 작업 방식 (기존 방식 유지)

```text
CP / 구현 단위 1개
→ 근거 확인 (code, docs/main, backend)
→ 문서 또는 코드 커밋
→ ledger 갱신
→ PR (base: main)
→ CI PASS
→ 머지
→ 다음 단위
```

- 완료 보고는 Master Plan §50 형식을 따른다.
- 실행하지 않은 테스트는 PASS로 쓰지 않는다.
- Stacked PR은 앞 PR이 머지된 뒤 base를 main으로 바꾸고 diff를 다시 확인한 다음 머지한다. CI는 base가 `main`인 PR에서만 실행된다.

---

## 7. Progress Ledger

| WS | 상태 | 근거 | 업데이트 |
| --- | --- | --- | --- |
| W0 | COMPLETE | [PR #52](https://github.com/WonhoOne/frontend/pull/52) merged | 2026-11-09 |
| W1 | COMPLETE | #46–#51 merged in order; delegated decisions recorded in Employee ledger (W1 closeout PR) | 2026-11-09 |
| W2 | COMPLETE | P1 CP0–CP11 PASS: #54, #55, P1-5 PR | 2026-11-09 |
| W3 | COMPLETE (on merge of #59, #60 and E-PR5) | E-PR1 #57, E-PR2 #58 merged; release gate met — [verification](employee-console/planning/audits/E-PR5-CP9-CP10-VERIFICATION.md) | 2026-11-09 |
| W4 | IN PROGRESS | D-A4, D-A7 done (W4 PR); D-A5 comments, D-A6 NFR record next | 2026-11-09 |
| W5 | NOT STARTED | — | — |

---

## 8. Risk Register

| Risk | 영향 | 대응 |
| --- | --- | --- |
| 14일 안에 Employee 기획 약 25단위 + 구현 | D-B 미완료 | 하루 여러 CP 단위 처리, 각 단위는 output gate만 충족하고 분량을 늘리지 않음. 11/13까지 CP11 미완료 시 Owner에게 범위·방식 재확인 |
| Mobbin 화면 열람 불가 (CP2-A 막힘) | CP2-B 지연 | 공식 제품 문서 근거로 CP2-A를 닫고, 근거 범위를 위임 결정으로 기록 |
| 시연 DB에 Employee 계정 존재 미확인 (`EmployeeBootstrap` 기본 비활성) | 시연 실패 | W3 CI job에서 bootstrap 활성 경로 검증, W5 시연 체크리스트에 포함. 실제 비밀번호는 Owner가 설정 |
| Inventory POST에 idempotency 계약 없음 | 중복 재고 추가 | 불확실한 결과에서 자동 재시도 금지, 재조회 후 사용자 확인 (CP5-B/CP8-B에서 확정) |
| Java `long` 재고 수량 vs JS number 정밀도 | 잘못된 표시 | Decoder에서 safe integer 검증 (CP8-A에서 확정) |
| 로컬에 Playwright 브라우저와 Backend/MySQL 없음 | 로컬 E2E 근거 부족 | `npx playwright install chromium`으로 로컬 E2E 실행, Real Backend 근거는 CI job으로 확보 |
