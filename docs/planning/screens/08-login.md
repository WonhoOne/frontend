# [S08] Login

> File: `screens/08-login.md`  
> Route / Trigger: `/login` + modal-route entry  
> CP6 Status: **Ready — CP6-E Complete**  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `screens/05-reservation-review.md`

---

# 1. Screen Purpose

Login은 고객이 인증된 상태로 전환되는 화면이면서,
현재 보고 있던 여행/예약 흐름의 문맥을 **가능한 한 끊지 않는 인증 surface**다.

Desktop에서 일반적인 앱 내부 진입은 modal-route를 우선하고,
`/login` direct URL에서는 독립 full-page auth 화면으로도 정상 동작해야 한다.

Login은 현재 Shared Contract가 확정하지 않은 인증 필드나 token 방식을
Frontend가 임의 정의하지 않는 것을 중요한 원칙으로 한다.

---

# 2. Route / Entry Conditions

## Route

```text
/login
```

## Entry Modes

### A. In-app modal-route

[FRONTEND PROPOSAL]

진입 예:

```text
Home / Tours / Tour Detail / Configure / Review
→ Login
→ current page retained behind modal
```

Desktop의 기본 진입 방식.

### B. Direct route

```text
/login
```

새 탭, refresh, external link로 직접 접근해도
full-page auth surface로 정상 렌더되어야 한다.

### C. Protected-action interception

향후 인증이 필요한 action에서:

```text
Protected action
→ Login
→ original context restore
```

예:

```text
My Trips access
Reservation Submit (if auth required by contract)
```

## Exit

Cancel/Close in modal mode:

```text
→ original route/context
```

Login Success:

일반 진입:

```text
→ previous route restore
→ Previous Trips Popup
```

transactional 진입:

```text
→ transaction context restore first
→ Previous Trips Popup timing follows section 16/19 proposal
```

Direct `/login` success:

[TBD]

정확한 post-login default destination은 Product/Auth policy가 필요하다.

Frontend 기본 fallback 후보:

```text
/
```

하지만 공통 계약 없이 최종 고정하지 않는다.

---

# 3. User Goal

Primary goal:

> 기존 계정으로 인증하고 원래 하던 작업을 계속한다.

Secondary goals:

- 계정이 없다면 Sign Up으로 이동
- 오류가 발생해도 입력을 잃지 않고 재시도
- modal login인 경우 취소하고 원래 화면으로 돌아가기

---

# 4. Required Data

## Authentication fields

[BLOCKED BY SHARED CONTRACT]

현재 확인된 공통 계약은:

```text
POST /api/v1/auth/login
```

endpoint skeleton뿐이다.

미확정:

- login identifier
- password/secret field
- username/email/contact 기반 여부
- request DTO
- response DTO
- token/session/cookie
- refresh policy
- remember-me
- logout/session expiry semantics

따라서 Screen Spec은 **실제 credential field 이름을 고정하지 않는다.**

UI 구현 전 API v0.2/Auth contract가 필요하다.

## Context data

[FRONTEND PROPOSAL]

modal-route login에는 다음 context가 필요하다.

```text
return route
return UI state
pending intent
reservation/configuration draft reference when applicable
```

이를 Backend API field로 만들 필요는 없다.
Frontend navigation/session state일 수 있다.

---

# 5. Desktop Layout

## Modal-route mode

```text
┌──────────────────────────────────────────────────────────────┐
│ retained previous page                                      │
│                        dim / restrained blur                 │
│                                                              │
│              ┌────────────────────────────┐                  │
│              │ Mister World               │                  │
│              │                            │                  │
│              │ Welcome back               │                  │
│              │ short supporting copy      │                  │
│              │                            │                  │
│              │ [ credential field(s) ]    │                  │
│              │                            │                  │
│              │ [ Login ]                  │                  │
│              │                            │                  │
│              │ New here? Sign up          │                  │
│              └────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

### Dialog width

CP3 Dialog 기준:

```text
480–560px preferred
```

필드 수가 auth contract에서 늘어나면
dialog를 무리하게 키우지 않고 direct-page layout 검토.

## Direct route mode

[FRONTEND PROPOSAL]

```text
┌──────────────────────────────┬───────────────────────────────┐
│ quiet travel visual / brand  │ Login                         │
│                              │                               │
│                              │ credential fields             │
│                              │ [ Login ]                     │
│                              │ Sign up                       │
└──────────────────────────────┴───────────────────────────────┘
```

단, auth 하나를 위해 과도한 marketing section을 만들지 않는다.

---

# 6. Mobile Layout

## In-app login

Desktop dialog를 그대로 축소하지 않는다.

기본:

```text
full-screen auth surface
or
full-height sheet
```

권장 구조:

```text
Top bar: Close / Back
↓
Brand mark
↓
Heading
↓
Credential fields
↓
Primary Login button
↓
Sign Up link
```

## Direct `/login`

동일한 full-screen page.

## Keyboard

모바일 software keyboard가 CTA를 가리지 않도록
scrollable form + safe bottom inset.

## Touch

- input min-height 52px
- CTA min-height 52px
- close/back >= 44×44px

---

# 7. Exact Section Order

```text
01 Auth Header / Close
02 Brand Mark
03 Login Heading
04 Supporting Copy
05 Credential Fields
06 Field/Error Region
07 Login CTA
08 Sign Up Entry
```

Password reset / social login은 현재 요구사항에 없으므로 넣지 않는다.

---

# 8. Component Composition

## Page / Domain Components

```text
LoginRoute
├── AuthSurface
│   ├── AuthHeader
│   ├── AuthBrand
│   ├── LoginForm
│   │   ├── CredentialFields
│   │   ├── AuthErrorRegion
│   │   └── LoginAction
│   └── SignupEntry
└── AuthReturnContext
```

## Design-System Primitives

```text
Dialog
BottomSheet / Fullscreen Surface
TextField
Button
TextLink
ErrorState
Skeleton (rare)
```

## New domain components

```text
AuthSurface
AuthReturnContext
```

---

# 9. Primary / Secondary CTA

## Primary

```text
Label: 로그인
Action: submit auth request
Endpoint: POST /api/v1/auth/login
Enabled when:
- required credential fields valid per contract
- not submitting
```

## Loading

```text
로그인
→ 로그인 중…
```

button width 유지.

## Success

auth state confirmed 이후 context recovery.

## Failure

input 유지.

## Secondary

```text
회원가입
→ /signup
```

## Close/Cancel

modal-route mode only:

```text
→ previous route/context
```

---

# 10. Interaction Rules

## Submit

- Enter key submit 지원
- repeated submit 차단
- credential fields는 contract validation 적용
- client validation이 Backend auth result를 대체하지 않음

## Invalid credentials

[FRONTEND COPY PROPOSAL]

credential 종류를 특정하지 않는 generic copy:

```text
입력한 로그인 정보를 확인해주세요.
```

`이메일 또는 비밀번호`처럼 계약되지 않은 field명을 고정하지 않는다.

## Network failure

입력값 유지.

## Close modal

- previous screen state 유지
- Configure/Review draft 유지

## Signup link from modal

[FRONTEND PROPOSAL]

Signup으로 이동해도 `return context`를 가능한 한 보존.

가입 완료 후의 auto-login 여부는 contract 의존.

## Login success

1. auth state 저장/확정
2. return context 복구
3. post-login previous-history behavior 수행

정확한 session 저장 방식은 contract 의존.

---

# 11. Motion

## Modal Enter/Exit

`Dialog Motion`

Backdrop:
- 180–240ms

Dialog:
- opacity + translateY + subtle scale

## Direct route

`Standard Forward Page Transition`

## Login Submit

`Button Motion`의 Loading / Success state

## Login Success → History Popup

일반 비거래 흐름:

```text
Login dialog exits
→ 150–220ms separation
→ Previous Trips Popup enters
```

두 overlay가 겹치지 않는다.

## Reduced Motion

- backdrop/dialog 120ms 이하
- scale 제거
- opacity 중심

---

# 12. Loading

Login form 자체는 정적 shell.

Auth request 중:

- form 유지
- credential fields 기본적으로 disabled 또는 editing lock
- Login button `로그인 중…`
- full-page spinner 금지

초기 auth/session status 확인이 필요한 경우:

```text
AuthSurface 유지
+ compact local placeholder
```

화면 전체 skeleton은 필요하지 않다.

---

# 13. Empty

N/A.

Login form 자체에 데이터 empty 개념 없음.

---

# 14. Error

## Invalid Credential / Auth Rejection

Copy:

```text
입력한 로그인 정보를 확인해주세요.
```

- form top 또는 submit 가까운 region
- input 유지
- secret field clear 여부는 security/auth implementation 정책과 협의

## Network

```text
로그인할 수 없습니다.
연결 상태를 확인하고 다시 시도해주세요.
```

## Server

```text
잠시 문제가 발생했습니다.
잠시 후 다시 시도해주세요.
```

## Unauthorized

로그인 요청 자체의 rejection으로 처리.

## Offline

```text
로그인하려면 인터넷 연결이 필요합니다.
```

## Unknown

generic recovery + retry.

## Field Validation

contract가 확정한 required/format 기준만 inline 처리.

---

# 15. Retrying / Refreshing

## Retry

- 동일 form
- 입력값 유지
- submit button 재활성
- request 중복 방지

## Refreshing

N/A.

Login은 query 화면이 아님.

## Existing authenticated session

direct `/login` 접근 시 이미 로그인 상태라면:

[FRONTEND PROPOSAL]

불필요한 login form을 다시 보여주기보다
return/home으로 이동 또는 account state 안내.

정확한 redirect 정책은 auth integration 시 확정.

---

# 16. Edge Cases

## Direct URL

full-page login.

## Modal refresh

modal-route의 background route를 refresh 후 복구할 수 없는 경우
full-page `/login` fallback.

## Session expires during Reservation Review

```text
Submit
→ 401
→ Login
→ Review draft restore
→ user reconfirms
→ manual resubmit
```

자동 재제출 금지.

## Session expires during Configure

draft 유지.

## Double submit

one auth request.

## Slow network

button loading,
form geometry 유지.

## Login success but history fetch fails

auth success 유지.
History Popup에서 local error.

## Login success during transaction vs mandatory history popup

원본 요구는 로그인 후 이전 여행 목록 popup을 요구한다.

[FRONTEND PROPOSAL]

거래 흐름에서 login이 발생한 경우:

```text
auth success
→ transaction context 즉시 복구
→ previous-history popup은 transaction을 막지 않는 시점으로 지연
```

예:

- Review로 복귀 후 사용자가 다시 Submit하기 전에 popup을 강제하지 않음
- transaction 종료/다른 일반 route 진입 시 1회 표시 가능

이 timing은 CP6-G/H에서 원본 요구와 충돌 여부 재검토한다.

## Return route invalid

safe fallback:

```text
/
```

## Cross-tab session change

auth state sync가 가능하면 반영.
정확한 storage 정책은 CP8.

---

# 17. Accessibility

## Dialog

- `role="dialog"` / semantic dialog
- `aria-modal`
- labelled by Login heading
- focus trap
- open 시 첫 의미 있는 control로 focus
- close 시 trigger로 focus return

## Form

- visible labels
- placeholder가 label 대체 금지
- error와 field `aria-describedby`
- form error summary 필요한 경우 polite region

## Keyboard

- Tab order logical
- Enter submit
- Escape modal close when safe
- disabled/loading state announce

## Screen Reader

Login status:

```text
로그인 중
로그인 실패
로그인 성공
```

필요한 수준에서 announce.

## Touch

>=44×44px.

## Reduced Motion

CP4 준수.

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| Login endpoint | API skeleton | CONFIRMED endpoint skeleton | form submit |
| Login request DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | credential fields |
| Login response DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | auth state |
| Auth mechanism | baseline TBD | BLOCKED BY SHARED CONTRACT | token/session |
| Protected route policy | baseline TBD | BLOCKED BY SHARED CONTRACT | auth gate |
| Previous travel popup after login | original requirement | CONFIRMED | post-login flow |
| Travel history endpoint | API skeleton | CONFIRMED endpoint skeleton | popup load |
| Return-context preservation | frontend planning | FRONTEND PROPOSAL | modal-route UX |

---

# 19. TBD / Blocker

## TBD / Blocked

- login identifier
- secret/password field
- validation format
- token/session/cookie model
- persistence/refresh
- authenticated default route
- logout/session expiry exact behavior
- reservation login requirement

## Frontend Proposal Awaiting Audit

- desktop modal-route
- mobile full-screen auth
- return-context preservation
- transaction 중 previous-history popup 지연
- already-authenticated `/login` redirect behavior

---

# 20. Acceptance Criteria

## Functional

- [ ] `/login` direct access 가능.
- [ ] desktop in-app login은 modal-route 지원 가능 구조.
- [ ] mobile login은 full-screen/sheet 구조.
- [ ] submit 중 duplicate request 없음.
- [ ] login failure 후 입력/context 유지.
- [ ] modal close 시 원래 화면 복귀.
- [ ] successful login 후 return context 복구.
- [ ] auth-required transaction에서 draft 유지.
- [ ] auto-resubmit 하지 않는다.

## Visual

- [ ] SaaS/admin login처럼 과도하게 generic하지 않음.
- [ ] 여행 브랜드 tone 유지.
- [ ] excessive glass/gold 없음.
- [ ] form hierarchy 명확.

## Loading/Error

- [ ] full-screen spinner 없음.
- [ ] button-level submitting state.
- [ ] network/server/auth rejection 분리 가능.
- [ ] history fetch failure가 login success를 무효화하지 않음.

## Responsive

- [ ] software keyboard가 CTA를 가리지 않음.
- [ ] touch target >=44px.
- [ ] direct/mobile layout 정상.

## Accessibility

- [ ] visible label 사용.
- [ ] dialog focus trap/return.
- [ ] Enter submit.
- [ ] Escape close when safe.
- [ ] error association.
- [ ] reduced motion.

## Contract Safety

- [ ] email/password를 계약 없이 고정하지 않는다.
- [ ] social login/password reset을 요구사항처럼 추가하지 않는다.
- [ ] token/session 방식을 frontend가 발명하지 않는다.
- [ ] reservation auth requirement를 임의 확정하지 않는다.

---

# Screen Status

```text
Ready
```
