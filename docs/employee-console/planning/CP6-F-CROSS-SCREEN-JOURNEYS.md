# CP6-F — Employee Cross-Screen Journeys and Global Surfaces

> Status: **COMPLETE — DELEGATED DECISION (2026-11-09)**
> Inputs: [CP6-0](CP6-0-SCREEN-INVENTORY.md), screens [E01](screens/E01-employee-login-and-access.md)–[E05](screens/E05-inventory.md), [CP1-B §4–§5](CP1-B-INFORMATION-ARCHITECTURE.md), [CP4](CP4-MOTION-AND-FEEDBACK.md), [CP5](CP5-DATA-AND-MUTATION-STATES.md)

## 1. Navigation map

```text
/employee ──anon──▶ /employee/login ──EMPLOYEE──▶ returnTo | /employee/tours (E02)
                                                       │
            ┌──────────────── top bar ─────────────────┤
            ▼                                          ▼
   E02 /employee/tours ──+ 새 여행상품──▶ E03 /new ──201(replace)──▶ E02 (+status, highlight)
            │                                ▲
            └──name link──▶ E04 /:id/edit ───┘ breadcrumb/취소 (dirty guard)
                              └──200──▶ stays on E04 (+status)
   E05 /employee/inventory ──재고 추가──▶ dialog ──200──▶ E05 (+status, highlight)
```

## 2. Global surfaces (all authenticated `/employee/*`)

| Surface | Rule |
| --- | --- |
| `EmployeeShell` top bar | Present on E02–E05, permission state and not-found state; absent on E01 login |
| Customer chrome | Never mounted under `/employee/*`: no `GlobalHeader`, `TransactionHeader`, `PostLoginPreviousTrips`, `CustomerVoiceControl` |
| `OfflineBanner` | Shown when offline (existing) |
| Status line | One per page, `role="status"`, cleared on next navigation or submit |
| Not-found | Unknown `/employee/*` → inside shell: H1 "페이지를 찾을 수 없습니다" + `여행상품 목록으로` (Customer `NotFound` is not used) |

## 3. Dirty guard — single policy for E03 / E04

| Trigger | Behavior |
| --- | --- |
| Nav link, breadcrumb, `취소`, browser Back/Forward | In-app blocker → `Dialog` "저장하지 않은 변경 사항이 있습니다" / "이 페이지를 나가면 입력한 내용이 사라집니다." Buttons `계속 편집` (initial focus) and `나가기` (destructive) |
| Reload / tab close | Native `beforeunload` prompt |
| `로그아웃` | Same dialog first; on `나가기` → sign out |
| While a save request is in flight | Navigation controls stay enabled; blocker dialog text adds "저장 요청이 아직 끝나지 않았습니다." |
| After successful save / create | Not dirty; no prompt |

## 4. Session and role transitions

| Event | Result |
| --- | --- |
| Session lost while signed in (any 401 or token expiry) | Page stays; sticky banner with `다시 로그인` → `/employee/login?returnTo=<current>` (unsaved-changes dialog asks if needed) — CP5 §3.5, revised in E-PR2 |
| No session on a fresh visit (reload, bookmark) | Redirect to `/employee/login?returnTo=<current>` (replace) |
| 401 inside the E05 stock dialog | Same banner; the dialog stays as it is (the result of that POST is already known: rejected) |
| 403 anywhere | Permission state inside shell |
| Sign-out | Clear memory token + private caches → `/employee/login` + notice "로그아웃했습니다." |
| Login as CUSTOMER on `/employee/login` | Session discarded; wrong-account alert (E01) |
| Customer session opens `/employee/*` | Permission state with `직원 계정으로 다시 로그인` (signs out first) |

`returnTo` validation is identical everywhere (E01 §2).

## 5. Cross-screen consistency check (pre-audit)

| Item | E01 | E02 | E03 | E04 | E05 |
| --- | --- | --- | --- | --- | --- |
| H1 present, one per page | ✓ | ✓ | ✓ | ✓ | ✓ |
| Status line channel | notice | create success | — (navigates) | save success | add success |
| Error summary / alert `role="alert"` | ✓ | — | ✓ | ✓ | dialog ✓ |
| Unknown outcome handling | — | — | confirm-resend | re-send (PUT) | refetch + confirm |
| Theme label via `tourThemeTitle` | — | ✓ | ✓ (select) | ✓ | — |
| KRW via `formatKrw` | — | ✓ | helper | helper | — |
| Item labels from catalog | — | — | — | — | ✓ |
| 401 / 403 behavior from §4 | ✓ | ✓ | ✓ | ✓ | ✓ |

## 6. Critical Employee journeys (input to CP10)

| ID | Journey |
| --- | --- |
| EJ01 | Anonymous → `/employee` → login as EMPLOYEE → product list |
| EJ02 | Create Golf product with three prices → appears in list highlighted |
| EJ03 | Edit name/price of a product → saved values shown, stays on editor |
| EJ04 | Theme change on product with schedules → 409 → revert Theme → save succeeds |
| EJ05 | Add 5 units to 골프공 → row shows server total |
| EJ06 | CUSTOMER account on Employee login → refused, no session |
| EJ07 | Reload on inventory → login → back on inventory |
| EJ08 | Leave editor with changes → confirm → stay / leave |
| EJ09 | Network loss on stock add → unknown state → refetch → explicit re-add |
| EJ10 | Keyboard-only EJ02 + EJ05 |

## 7. Gate

- [x] Every route transition, guard and session event has one defined behavior
- [x] Global surfaces and Customer-chrome exclusion fixed
- [x] Consistency table shows no conflicting channel or label source
- [x] Critical journeys listed for CP10

**Next: CP6-G/H/I audits (P1-4).**
