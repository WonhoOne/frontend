# [SXX] <Screen Name>

> File: `screens/XX-<slug>.md`  
> Route / Trigger: `<route or event>`  
> CP6 Status: Draft / Review / Ready  
> Depends on:
> - `07-SCREEN-SPECS.md`
> - relevant CP0~CP5 documents

---

# 1. Screen Purpose

화면의 존재 이유를 2~5문장으로 작성한다.

반드시 포함:
- 이 화면이 사용자 여정에서 맡는 역할
- 이전/다음 화면과의 차이
- 이 화면에서 해결해야 하는 핵심 질문

---

# 2. Route / Entry Conditions

## Route

```text
<route>
```

## Entry

- 어디서 진입하는가
- direct URL 허용 여부
- 필요한 route param
- 필요한 draft/context
- 인증 필요 여부

## Exit

- Primary destination
- Secondary destination
- Browser Back
- Close/Cancel behavior

---

# 3. User Goal

사용자가 이 화면에 들어와서 달성하려는 일을 적는다.

```text
Primary goal:
Secondary goal:
```

---

# 4. Required Data

UI가 필요로 하는 data need만 작성한다.
DTO field name을 임의로 확정하지 않는다.

예:

```text
[CONFIRMED] Theme identity
[CONFIRMED] Allowed Tour Styles
[TBD] Exact image asset
[BLOCKED BY SHARED CONTRACT] API DTO field names
```

---

# 5. Desktop Layout

## Container

- width
- grid
- sticky/fixed behavior
- hero behavior

## Structure

ASCII diagram 권장:

```text
┌──────────────────────────────────┐
│ Header                           │
├──────────────────────────────────┤
│                                  │
│ Content                          │
│                                  │
└──────────────────────────────────┘
```

## Scroll behavior

- page scroll
- sticky region
- overflow region

---

# 6. Mobile Layout

반드시 Desktop과 별도로 작성한다.

포함:

- stacking order
- sticky bottom action
- modal → sheet/page 변환
- image ratio/crop
- navigation
- touch interaction
- safe area
- scroll

Tablet behavior도 필요한 경우 명시.

---

# 7. Exact Section Order

실제 DOM/visual 순서에 가까운 형태로 작성한다.

```text
01 Header
02 Hero
03 ...
04 ...
```

순서를 임의로 변경하면 UX가 바뀌는 경우 이유 명시.

---

# 8. Component Composition

## Page / Domain Components

```text
ScreenPage
├── ...
├── ...
└── ...
```

## Design-System Primitives

```text
Button
OptionCard
Dialog
Skeleton
...
```

새 primitive가 필요하면:
`[FRONTEND PROPOSAL]`로 표시하고 CP3 확장 필요 여부 기록.

---

# 9. Primary / Secondary CTA

## Primary

```text
Label:
Action:
Destination:
Enabled when:
Loading:
Failure:
```

## Secondary

```text
...
```

## Tertiary / Quiet

필요 시.

## Destructive

필요 시.

---

# 10. Interaction Rules

사용자가 할 수 있는 모든 주요 interaction.

예:

- click
- select
- change
- back
- close
- retry
- scroll
- keyboard
- voice-applied state

각 interaction은 결과 state를 명시.

---

# 11. Motion

CP4 Motion primitive를 이름으로 참조한다.

예:

```text
Entry:
- Standard Forward Page Transition

Hero:
- Shared Hero Transition

Section:
- Section Reveal
```

새 motion을 임의로 정의하지 않는다.

Reduced Motion 동작 포함.

---

# 12. Loading

반드시 구체적으로 작성한다.

```text
Page-level:
Section-level:
Skeleton mapping:
Image placeholder:
Layout shift prevention:
```

Generic full-page spinner 금지.

---

# 13. Empty

```text
Applicable: Yes / No

Trigger:
Copy:
CTA:
Preserved UI:
```

N/A면 이유 작성.

---

# 14. Error

상태별:

```text
Network:
Server:
Not Found:
Validation:
Conflict:
Unauthorized:
Offline:
Image Failure:
Partial Failure:
```

필요 없는 것은 N/A.

각 상태에:

```text
Copy
Recovery
Preserved state
```

를 기록.

---

# 15. Retrying / Refreshing

```text
Retry scope:
During retry:
Existing content preserved:
Refresh indicator:
Stale-data handling:
```

N/A면 이유.

---

# 16. Edge Cases

최소 검토:

- direct URL
- refresh
- invalid param
- missing data
- stale data
- rapid repeated interaction
- slow network
- image failure
- browser back
- session expiration
- duplicate action
- mobile rotation / viewport change

화면에 해당되는 항목만 상세화.

---

# 17. Accessibility

## Structure

- `<main>`
- headings
- landmarks

## Keyboard

- tab order
- enter/space
- escape
- focus return

## Screen Reader

- labels
- live region
- status announcement

## Visual

- contrast
- color-independent state
- focus-visible
- reduced motion

## Touch

- >= 44x44 target

## Images

- alt strategy

---

# 18. API / Shared Contract Dependency

다음 형식 권장:

| Need | Current source | Status | Frontend impact |
|---|---|---|---|
| ... | ... | CONFIRMED/TBD/BLOCKED | ... |

Endpoint가 있더라도 DTO가 없으면 그렇게 명시한다.

Frontend가 임의 endpoint/field를 생성하지 않는다.

---

# 19. TBD / Blocker

## TBD

구현 일부를 막지 않는 미확정 항목.

## Blocked by Shared Contract

실제 integration 완료를 막는 항목.

## Frontend Proposal Awaiting Review

프론트 UX 결정 중 공통 영향 가능성이 있는 항목.

---

# 20. Acceptance Criteria

## Functional

- [ ] ...

## Visual / Design System

- [ ] ...

## Loading / State

- [ ] ...

## Error / Recovery

- [ ] ...

## Responsive

- [ ] ...

## Accessibility

- [ ] ...

## Navigation / Draft

- [ ] ...

## Contract Safety

- [ ] Screen Spec이 shared requirement를 새로 발명하지 않는다.
- [ ] TBD가 임의 구현값으로 굳어지지 않는다.

---

# Screen Status

```text
Draft
→ Review
→ Ready
```

`Ready` 조건:

- 20개 section 작성 완료
- Desktop/Mobile 완료
- states 완료
- motion 완료
- API deps 분류 완료
- acceptance criteria 검증 가능
