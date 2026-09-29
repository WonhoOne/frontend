# [S09] Sign Up

> File: `screens/09-signup.md`  
> Route / Trigger: `/signup`  
> CP6 Status: **Ready — CP6-E Complete**  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - `02-INFORMATION-ARCHITECTURE.md`
> - `04-DESIGN-SYSTEM.md`
> - `05-MOTION-SYSTEM.md`
> - `06-UI-STATES.md`
> - `screens/08-login.md`

---

# 1. Screen Purpose

Sign Up은 고객 계정을 생성하고,
원본 요구사항에서 요구하는 고객 기본 정보를 등록하는 화면이다.

확정된 고객 기본 정보:

```text
성명
주소
연락처
```

반면 실제 인증용 credential, 식별자, password 규칙 등은
현재 Shared Auth Contract에 확정되어 있지 않다.

따라서 Sign Up은 **확정된 프로필 정보와 미확정 인증 정보를 분리해서 설계**한다.

---

# 2. Route / Entry Conditions

## Route

```text
/signup
```

## Entry

- Login의 `회원가입`
- direct URL
- 향후 auth gate에서 account 없음 선택

인증 불필요.

## Return Context

[FRONTEND PROPOSAL]

Login modal에서 Signup으로 진입했다면
원래 화면/transaction return context를 가능한 한 유지한다.

## Exit

Back to Login:

```text
→ /login
```

Signup Success:

[TBD]

가능한 정책:

```text
A. Account created → Login
B. Account created + authenticated → return context
```

현재 Auth Contract가 없으므로 최종 결정하지 않는다.

---

# 3. User Goal

Primary goal:

> Mister World 고객 계정을 생성한다.

Secondary goals:

- 요구되는 고객 기본 정보를 정확히 입력
- 오류가 난 field를 이해하고 수정
- 가입 완료 후 Login 또는 원래 흐름으로 자연스럽게 이어짐

---

# 4. Required Data

## Customer profile fields

[CONFIRMED — original requirement]

고객 회원 정보에 최소:

```text
성명
주소
연락처
```

를 저장한다.

## Employee signup

[CONFIRMED system requirement / OUTSIDE FRONTEND SCOPE]

원본은 직원 회원정보도 관리하지만,
`WonhoOne/frontend`는 Customer GUI이므로 직원 가입 UI는 만들지 않는다.

Employee flow는 해당 owner/repository 책임.

## Authentication fields

[BLOCKED BY SHARED CONTRACT]

미확정:

- account identifier
- password/secret
- email 여부
- username 여부
- contact를 auth identifier로 사용하는지
- password constraints
- duplicate-account condition
- signup response
- verification process

이 항목을 임의 필드로 확정하지 않는다.

## Frequent-customer information

[CONFIRMED concept]

고객 정보는 frequent-customer discount에 활용될 수 있다.

[TBD]

- 기준
- 할인율
- enrollment/status
- signup에서 관련 consent/표시가 필요한지

따라서 Sign Up에서 discount 약속/등급 UI를 임의 생성하지 않는다.

---

# 5. Desktop Layout

## Default direct page

```text
┌──────────────────────────────┬───────────────────────────────┐
│ BRAND / TRAVEL VISUAL        │ CREATE YOUR ACCOUNT           │
│                              │                               │
│ quiet editorial content      │ Profile                       │
│                              │ [ 성명 ]                      │
│                              │ [ 주소 ]                      │
│                              │ [ 연락처 ]                    │
│                              │                               │
│                              │ Account credentials           │
│                              │ [ contract-defined fields ]   │
│                              │                               │
│                              │ [ 회원가입 ]                  │
│                              │                               │
│                              │ 이미 계정이 있나요? 로그인   │
└──────────────────────────────┴───────────────────────────────┘
```

## In-app modal transition

[FRONTEND PROPOSAL]

필드 수가 많을 가능성이 있으므로
Sign Up 전체를 작은 modal 안에 억지로 넣지 않는다.

Login modal에서 회원가입을 누르면:

```text
→ dedicated `/signup` page
```

를 기본으로 한다.

return context는 navigation state로 유지 가능.

## Form Width

`container-auth` 중심.

address field가 긴 경우 충분한 width 확보.

---

# 6. Mobile Layout

```text
Top bar: Back
↓
Brand mark
↓
Create your account
↓
Profile information
  성명
  주소
  연락처
↓
Contract-defined credential fields
↓
Validation
↓
회원가입
↓
로그인
```

- single-column
- software keyboard 대응
- postal/address selector 같은 기능은 계약 없이 임의 추가하지 않음
- address를 몇 개의 subfield로 쪼갤지도 contract/UX 결정 전 고정하지 않음

---

# 7. Exact Section Order

```text
01 Auth Header
02 Brand / Heading
03 Customer Profile Section
   03-1 Name
   03-2 Address
   03-3 Contact
04 Account Credential Section (contract-defined)
05 Validation / Error Region
06 Sign Up CTA
07 Login Entry
```

법률 동의/마케팅 동의 checkbox는
공통 요구나 실제 서비스 정책이 없으므로 현재 화면에 임의 추가하지 않는다.

---

# 8. Component Composition

## Page / Domain Components

```text
SignupPage
├── AuthHeader
├── AuthBrand
├── SignupForm
│   ├── CustomerProfileFields
│   │   ├── NameField
│   │   ├── AddressField
│   │   └── ContactField
│   ├── CredentialFields
│   ├── SignupErrorRegion
│   └── SignupAction
└── LoginEntry
```

## Design-System Primitives

```text
PageContainer
TextField
Button
TextLink
ErrorState
```

## New domain component

```text
CustomerProfileFields
```

---

# 9. Primary / Secondary CTA

## Primary

```text
Label: 회원가입
Action: create customer account
Endpoint: POST /api/v1/auth/signup
Enabled when:
- contract-required fields complete/valid
- not submitting
```

## Loading

```text
회원가입
→ 계정 만드는 중…
```

## Success

[TBD]

auto-login 여부에 따라:

```text
→ Login
or
→ return context
```

## Secondary

```text
로그인
→ /login
```

---

# 10. Interaction Rules

## Field Validation

Frontend는 UX 차원의 validation만 수행.

확정 가능한 것:

- required 여부는 contract/requirements 기준
- 성명/주소/연락처 입력 surface 존재

확정 불가:

- contact format exact regex
- password rule
- username rule

## Duplicate account

Backend response로 처리.

generic copy:

```text
이미 등록된 계정 정보가 있습니다.
입력 내용을 확인하거나 로그인해주세요.
```

단, 실제 duplicate key가 무엇인지는 error contract 필요.

## Back to Login

현재 입력이 있는 경우:

[FRONTEND PROPOSAL]

의미 있는 draft가 존재하면
즉시 버리는 대신 가벼운 discard confirmation 검토.

다만 Signup draft를 장기간 저장하지 않는다.

## Submission

- duplicate submit 방지
- server result 전 success 표시 금지

---

# 11. Motion

Entry:

`Standard Forward Page Transition`

Field/error:

CP4 control motion.

Submit:

`Button Motion`의 Loading / Success state

Login → Signup:
- modal에서 page로 갈 경우 modal exit 후 standard route transition

Reduced Motion:
- opacity/instant control feedback

---

# 12. Loading

Form shell 즉시.

Submit 중:

- form 유지
- CTA loading
- 중복 interaction 제한
- full-page spinner 없음

만약 address helper 등 외부 data가 향후 생기더라도
현재 scope에서는 정의하지 않는다.

---

# 13. Empty

N/A.

---

# 14. Error

## Field Validation

inline.

## Duplicate / Conflict

API error contract 기반.

## Network

```text
회원가입을 완료하지 못했습니다.
연결 상태를 확인하고 다시 시도해주세요.
```

입력 유지.

## Server

```text
잠시 문제가 발생했습니다.
입력한 내용은 유지됩니다.
다시 시도해주세요.
```

## Unauthorized

N/A.

## Offline

```text
회원가입하려면 인터넷 연결이 필요합니다.
```

## Unknown

form 유지 + retry.

---

# 15. Retrying / Refreshing

Retry:

- input 유지
- submit 재시도
- duplicate request 방지

Refreshing:
N/A.

---

# 16. Edge Cases

## Direct URL

정상.

## Refresh

브라우저 기본 form data 복원에 의존하지 않도록
필요 시 session-level draft 검토.

민감 credential은 persistent storage에 저장하지 않는다.

## Long address

multi-line/appropriate input UI 검토.
주소 길이가 layout을 깨지 않음.

## Contact formatting

contract 전 임의 mask를 강제하지 않음.

## Duplicate account

server message 안전하게 map.

## Signup success but auto-login unsupported

Login으로 이동.

## Signup launched from Reservation Review auth flow

return context 보존.

가입 후 Login이 필요하면:
- Login
- context restore
- user manually resumes transaction

## Back with dirty form

discard confirmation은 과도하지 않게.

## Mobile keyboard

CTA/field 가림 방지.

---

# 17. Accessibility

## Form

- visible label
- input `autocomplete`은 contract field type에 맞게 사용
- required state programmatic
- error `aria-describedby`
- error summary 필요 시 heading/link

## Keyboard

- logical tab order
- Enter submit where safe
- Back link accessible

## Screen Reader

section grouping:
- 고객 정보
- 계정 정보

## Touch

>=44px.

## Color

error/required를 color만으로 표현하지 않음.

## Reduced Motion

지원.

---

# 18. API / Shared Contract Dependency

| Need | Current Source | Status | Frontend Impact |
|---|---|---|---|
| Signup endpoint | API skeleton | CONFIRMED endpoint skeleton | submit |
| customer name/address/contact | original requirement | CONFIRMED | profile fields |
| employee signup existence | original requirement | CONFIRMED / out of frontend scope | no employee UI |
| signup request DTO | API v0.2 | BLOCKED BY SHARED CONTRACT | exact fields |
| account credential model | baseline TBD | BLOCKED BY SHARED CONTRACT | auth fields |
| contact validation format | none | TBD | field validation |
| signup response/auto-login | API/Auth TBD | BLOCKED BY SHARED CONTRACT | post-success flow |
| frequent customer discount | original concept / baseline TBD | CONFIRMED concept / TBD policy | no signup promise |
| legal/marketing consent | none | TBD/not required by current source | do not invent |

---

# 19. TBD / Blocker

## TBD / Blocked

- exact auth credential fields
- password/security rule
- duplicate-account key
- contact validation
- address structure
- signup response
- auto-login
- post-signup destination
- legal/consent requirements if later introduced

## Frontend Proposal Awaiting Audit

- dedicated Signup page
- profile/credential section separation
- return-context preservation
- dirty-form discard confirmation

---

# 20. Acceptance Criteria

## Functional

- [ ] `/signup` direct access 가능.
- [ ] 성명/주소/연락처 입력 surface 존재.
- [ ] employee signup UI를 고객 frontend에 만들지 않음.
- [ ] submit 중 duplicate request 없음.
- [ ] failure 후 입력값 유지.
- [ ] Login으로 이동 가능.
- [ ] return context를 보존 가능한 구조.

## Visual

- [ ] 긴 Bootstrap form처럼 보이지 않음.
- [ ] profile/credential hierarchy 명확.
- [ ] brand visual이 form usability를 방해하지 않음.

## Loading/Error

- [ ] full-page spinner 없음.
- [ ] inline field error.
- [ ] network/server/conflict recovery.
- [ ] submit failure 후 form 유지.

## Responsive

- [ ] mobile single-column.
- [ ] address/contact가 narrow viewport에서 깨지지 않음.
- [ ] keyboard가 CTA를 가리지 않음.

## Accessibility

- [ ] 모든 field visible label.
- [ ] required/error programmatic.
- [ ] logical tab order.
- [ ] touch target >=44px.
- [ ] reduced motion.

## Contract Safety

- [ ] email/password를 계약 없이 고정하지 않는다.
- [ ] 연락처 regex를 임의 확정하지 않는다.
- [ ] auto-login을 임의 확정하지 않는다.
- [ ] marketing/legal consent를 요구사항처럼 추가하지 않는다.
- [ ] frequent-customer discount 정책을 Signup에서 발명하지 않는다.

---

# Screen Status

```text
Ready
```
