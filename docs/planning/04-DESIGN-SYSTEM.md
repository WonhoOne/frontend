# Mister World Frontend Design System

> Document: `04-DESIGN-SYSTEM.md`  
> Status: **CP3 Complete**  
> Scope: `WonhoOne/frontend` Customer GUI  
> Planning baseline: 2026-09-29  
> Depends on: `00-PLANNING-INDEX.md`, `01-PRODUCT-EXPERIENCE.md`, `02-INFORMATION-ARCHITECTURE.md`, `03-VISUAL-DIRECTION.md`

---

# 0. CP3 Objective

CP3의 목표는 CP2에서 확정한

> **Cinematic Travel × Luxury Editorial × Modern Product UI**

를 구현자가 임의로 해석하지 않도록 **Design Token + Primitive Component 계약**으로 변환하는 것이다.

이 문서부터는 실제 숫자를 고정한다.

결정 범위:

- exact color tokens
- typography family / size / weight / line-height
- spacing scale
- container widths
- layout grid
- breakpoint foundation
- radius
- border
- elevation
- icon sizing
- button
- input
- selector
- card primitive
- dialog / bottom sheet
- status / badge
- skeleton primitive
- focus / disabled state
- overlay / z-index
- responsive foundation

Motion duration/easing은 CP4에서 별도 확정한다.

---

# 1. Design-System Principles

## DS-01 — Token first

페이지에서 아래와 같은 임의 값을 직접 만들지 않는다.

```css
margin-top: 37px;
border-radius: 13px;
color: #222;
box-shadow: 0 8px 17px rgba(...);
```

반드시 가장 가까운 system token을 먼저 사용한다.

예외가 필요한 경우:

1. 이유를 component spec에 기록
2. 반복된다면 token으로 승격
3. 한 화면에서만 시각적 보정을 위해 사용하는 값은 local token으로 한정

---

## DS-02 — Warm neutral is the default, not beige decoration

Warm Ivory 계열은 화면 전체를 누렇게 만드는 장식이 아니다.

기본 구조:

```text
Canvas         warm ivory
Content        warm white / ivory
Elevated       near-white
Primary text   charcoal
Secondary      warm gray
Accent         muted brass
```

사진의 색이 실제 브랜드 컬러 역할을 담당한다.

---

## DS-03 — Black CTA before Gold CTA

Primary action은 기본적으로 깊은 Charcoal을 사용한다.

Champagne / Brass는 선택 상태와 정교한 detail에 사용한다.

럭셔리를 표현하기 위해 금색 버튼을 남발하지 않는다.

---

## DS-04 — White space is a component

Spacing은 빈 영역이 아니라 시각적 hierarchy의 일부다.

큰 Section은 카드 테두리보다 공간으로 구분한다.

---

## DS-05 — States belong to primitives

모든 interactive primitive는 최소:

```text
default
hover
pressed
focus-visible
disabled
loading
```

을 고려한다.

선택형 primitive는 추가로:

```text
selected
unselected
invalid
```

상태를 가진다.

---

# 2. Color System

## 2.1 Foundation Colors

| Token | Value | Usage |
|---|---|---|
| `--mw-canvas` | `#F6F3ED` | 기본 페이지 배경 |
| `--mw-surface` | `#FBF9F5` | 일반 section / control background |
| `--mw-surface-elevated` | `#FFFDFC` | floating / dialog / summary |
| `--mw-surface-muted` | `#EEE9E1` | inactive / skeleton / muted section |
| `--mw-ink` | `#191918` | primary text / primary CTA |
| `--mw-ink-soft` | `#34322F` | secondary strong text |
| `--mw-text-secondary` | `#6E6961` | body secondary / metadata |
| `--mw-text-tertiary` | `#918A80` | quiet labels / placeholders |
| `--mw-border` | `#DDD7CE` | default border |
| `--mw-border-strong` | `#BDB5A9` | selected / emphasis neutral border |
| `--mw-overlay` | `rgba(15, 14, 12, 0.48)` | modal/image overlay |
| `--mw-overlay-strong` | `rgba(15, 14, 12, 0.68)` | hero text protection only |

### Rules

- `--mw-surface-elevated`를 모든 카드에 사용하지 않는다.
- `--mw-overlay-strong`은 hero readability가 실제로 필요할 때만 사용한다.
- `--mw-border`를 section separation의 기본 수단으로 사용하지 않는다.

---

## 2.2 Brand Accent

| Token | Value | Usage |
|---|---|---|
| `--mw-accent` | `#9B7A4B` | selected detail / focus accent |
| `--mw-accent-hover` | `#87673C` | accent interactive hover |
| `--mw-accent-soft` | `#EEE3D2` | selected surface |
| `--mw-accent-faint` | `#F6EFE4` | low emphasis background |
| `--mw-on-accent` | `#181512` | text on pale accent |

Accent 최대 사용 원칙:

> 한 viewport 안에서 “금속성 accent가 눈에 띄는 요소”는 1~3개 정도로 제한한다.

---

## 2.3 Semantic Colors

상태 색은 브랜드 색보다 의미 전달이 우선이다.

| Token | Value | Usage |
|---|---|---|
| `--mw-success` | `#2F6B50` | confirmed / success |
| `--mw-success-soft` | `#E6F0EA` | success surface |
| `--mw-warning` | `#9B672F` | attention / recruiting nuance |
| `--mw-warning-soft` | `#F3E9DC` | warning surface |
| `--mw-danger` | `#A34B44` | destructive / invalid |
| `--mw-danger-soft` | `#F6E7E5` | error surface |
| `--mw-info` | `#496A7D` | neutral informational |
| `--mw-info-soft` | `#E7EEF2` | info surface |

### Semantic usage

- `Confirmed`는 success.
- 모집 중이라고 해서 전체 UI를 warning orange로 만들지 않는다.
- form error는 danger.
- destructive action은 현재 프로젝트에서 많지 않으므로 danger 사용량도 제한한다.

---

# 3. Theme Local Accents

Theme accent는 전체 UI palette를 교체하지 않는다.

해당 Theme Hero, tiny label, decorative line 등 제한된 곳에서만 사용한다.

| Theme | Local Accent | Value |
|---|---|---|
| Honeymoon Romance | Dust Rose | `#9A6C68` |
| Parents Healing | Sage | `#6F7D68` |
| Golf Challenge | Resort Green | `#365744` |
| Outdoor Trekking | Mineral Blue Gray | `#596971` |

각 accent의 soft surface는 8~12% tint 수준으로 구현한다.

### Forbidden

```text
Honeymoon page = 전체 핑크
Golf page = 전체 초록
Trekking page = 전체 회색
```

Theme identity는 **image first**다.

---

# 4. Typography System

## 4.1 Font Family

### Primary UI / Korean / Body

```css
font-family:
  "Pretendard Variable",
  Pretendard,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Noto Sans KR",
  sans-serif;
```

역할:

- 한국어
- body
- UI control
- number
- metadata
- button
- form
- card

### Editorial Latin Accent

```css
font-family:
  "Instrument Serif",
  "Times New Roman",
  serif;
```

사용 범위:

- 영문 Hero statement
- 영문 editorial phrase
- 일부 Theme title treatment

금지:

- 한국어 문장 전체
- form / button
- 가격
- 날짜
- status
- 긴 body

### Font loading rule

외부 webfont 로딩 실패 시에도 layout이 심하게 깨지지 않도록 fallback metric을 고려한다.

Font file은 repo에 무분별하게 포함하지 않고 프로젝트 배포 정책에 맞춰 결정한다.

---

## 4.2 Type Tokens

### Desktop

| Token | Size | Line height | Weight | Use |
|---|---:|---:|---:|---|
| `display-2xl` | 96px | 0.96 | 400/500 | Home Hero Latin |
| `display-xl` | 72px | 1.00 | 400/500 | Tour Detail Hero |
| `display-lg` | 56px | 1.06 | 500 | Large section |
| `heading-xl` | 40px | 1.15 | 600 | Section title |
| `heading-lg` | 32px | 1.20 | 600 | Major card / page subhead |
| `heading-md` | 24px | 1.28 | 600 | Component title |
| `heading-sm` | 20px | 1.35 | 600 | Compact component title |
| `body-lg` | 18px | 1.65 | 400/500 | Intro body |
| `body-md` | 16px | 1.60 | 400/500 | Default body |
| `body-sm` | 14px | 1.55 | 400/500 | Secondary |
| `label-md` | 14px | 1.30 | 600 | Button/input label |
| `label-sm` | 12px | 1.30 | 600 | Eyebrow / metadata |
| `micro` | 11px | 1.25 | 600 | rare micro label |

### Mobile

| Token | Size | Line height |
|---|---:|---:|
| `display-2xl` | 58px | 0.98 |
| `display-xl` | 48px | 1.02 |
| `display-lg` | 40px | 1.08 |
| `heading-xl` | 32px | 1.18 |
| `heading-lg` | 28px | 1.22 |
| `heading-md` | 22px | 1.30 |
| `heading-sm` | 19px | 1.35 |
| `body-lg` | 17px | 1.60 |
| 나머지 | desktop과 동일 | 동일 |

---

## 4.3 Tracking

| Context | Tracking |
|---|---:|
| Large Latin editorial | `-0.025em` |
| Korean heading | `-0.020em` |
| Body | `-0.008em` ~ `0` |
| Label | `0` |
| Eyebrow uppercase Latin | `0.08em` |

한글 자간을 과도하게 벌려 luxury를 만들지 않는다.

---

## 4.4 Numeric Alignment

가격 / 인원 / 진행률처럼 값이 자주 변하는 곳은 가능하면:

```css
font-variant-numeric: tabular-nums;
```

사용.

Configuration Summary에서 숫자 변경 시 layout jump를 줄인다.

---

# 5. Spacing System

4px 기반이지만 모든 값을 촘촘히 노출하지 않는다.

| Token | Value |
|---|---:|
| `space-0` | 0 |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |
| `space-32` | 128px |
| `space-40` | 160px |

## Section rhythm

Desktop:

```text
compact section      64px
normal section       96px
editorial section   128px
hero transition     160px
```

Mobile:

```text
compact section      40px
normal section       64px
editorial section    80px
hero transition      96px
```

---

# 6. Container System

## 6.1 Width Tokens

| Token | Max width |
|---|---:|
| `container-wide` | 1440px |
| `container-main` | 1280px |
| `container-transaction` | 1180px |
| `container-reading` | 760px |
| `container-auth` | 520px |

## 6.2 Page Gutters

| Viewport | Horizontal gutter |
|---|---:|
| `< 640px` | 20px |
| `640–1023px` | 32px |
| `1024–1439px` | 48px |
| `≥ 1440px` | 64px |

Home Hero는 edge-to-edge image 사용 가능.

Text는 page gutter를 유지한다.

---

# 7. Grid System

## Desktop

```text
12 columns
24px gutter
```

사용:

- Home editorial layout
- Tour Detail storytelling
- Configure 7/5 또는 8/4 composition
- Reservation review

## Tablet

```text
8 columns
20px gutter
```

## Mobile

```text
4 columns
16px gutter
```

### Rule

Grid는 배치를 위한 도구이지
모든 Section을 강제로 column boundary에 맞추기 위한 족쇄가 아니다.

Editorial image는 의도적으로 grid를 넘길 수 있다.

---

# 8. Breakpoint Foundation

| Token | Value |
|---|---:|
| `bp-sm` | 640px |
| `bp-md` | 768px |
| `bp-lg` | 1024px |
| `bp-xl` | 1280px |
| `bp-2xl` | 1440px |

### Behavioral breakpoint

Configure의 sticky side summary는 기본적으로:

```text
>= 1024px
```

에서 사용한다.

그 이하에서는 bottom summary pattern으로 전환한다.

정확한 개별 screen adaptation은 CP9에서 검증한다.

---

# 9. Radius System

| Token | Value | Usage |
|---|---:|---|
| `radius-xs` | 4px | tiny status details |
| `radius-sm` | 8px | compact control |
| `radius-md` | 12px | input / button / small card |
| `radius-lg` | 18px | standard card / modal inner |
| `radius-xl` | 28px | large image / editorial surface |
| `radius-pill` | 999px | tag / segmented status only |

### Rule

하나의 component 안에서 radius를 과도하게 섞지 않는다.

모든 요소에 `28px`를 적용하는 Rounded Everything 금지.

---

# 10. Border System

| Token | Value |
|---|---|
| `border-subtle` | `1px solid #E7E1D8` |
| `border-default` | `1px solid #DDD7CE` |
| `border-strong` | `1px solid #BDB5A9` |
| `border-accent` | `1px solid #9B7A4B` |
| `border-danger` | `1px solid #A34B44` |

## Selection

Selected를 2~3px 굵은 테두리로만 표현하지 않는다.

Selected state 구성:

```text
accent/strong border
+ soft surface shift
+ text emphasis
+ optional check marker
```

---

# 11. Elevation / Shadow

## Elevation 0

```text
none
```

기본 카드.

## Elevation 1 — subtle lift

```css
0 1px 2px rgba(25, 23, 20, 0.05),
0 6px 18px rgba(25, 23, 20, 0.04)
```

사용:

- sticky header
- subtle hover lift only when needed

## Elevation 2 — floating

```css
0 12px 32px rgba(25, 23, 20, 0.10)
```

사용:

- configuration summary
- floating popover

## Elevation 3 — overlay

```css
0 24px 64px rgba(25, 23, 20, 0.16)
```

사용:

- dialog
- bottom sheet desktop-equivalent surfaces

### Rule

동일 화면에서 Elevation 2 이상의 surface가 여러 개 경쟁하지 않는다.

---

# 12. Focus System

Keyboard focus는 절대 제거하지 않는다.

기본 focus:

```css
outline: 2px solid #9B7A4B;
outline-offset: 3px;
```

사진 위 control처럼 대비가 부족한 경우:

```text
inner light ring
+
outer accent ring
```

을 사용할 수 있다.

`:focus-visible`을 우선 사용한다.

Mouse click 후 불필요한 focus ring이 계속 남는 경험을 줄인다.

---

# 13. Disabled System

Disabled는 단순 `opacity: 0.3` 하나로 끝내지 않는다.

기본:

```text
surface      #EEE9E1
text         #918A80
border       #DDD7CE
cursor       not-allowed
```

중요한 제약이라면 이유를 함께 제공한다.

예:

```text
Classic
Not available for Honeymoon Romance
```

다만 CP1의 기본 UX에서는 Honeymoon/Parents에서
Classic을 아예 노출하지 않는 방향을 우선한다.

---

# 14. Icon System

## Style

- outline
- 1.5–1.75px stroke
- round join/cap 선호
- optical size 일관성

## Size tokens

| Token | Value |
|---|---:|
| `icon-xs` | 14px |
| `icon-sm` | 16px |
| `icon-md` | 20px |
| `icon-lg` | 24px |
| `icon-xl` | 32px |

Default button icon:

```text
16–18px
```

Navigation:

```text
20px
```

Decorative 32px icon은 매우 제한적.

---

# 15. Button Primitive

## 15.1 Sizes

### Small

```text
height 36px
horizontal padding 14px
radius 10px
label 13–14px
```

### Medium — Default

```text
height 48px
horizontal padding 20px
radius 12px
label 14px / 600
```

### Large

```text
height 56px
horizontal padding 26px
radius 12px
label 15–16px / 600
```

Mobile primary action은 최소 52px 이상을 권장한다.

---

## 15.2 Variants

### Primary

```text
background  --mw-ink
text        --mw-surface-elevated
border      transparent
```

Hover:

```text
background  #2A2927
```

Pressed:

```text
background  #111110
```

### Secondary

```text
background  transparent
text        --mw-ink
border      --mw-border-strong
```

### Quiet

```text
background  transparent
text        --mw-ink-soft
border      none
```

### Accent

Champagne fill button을 일반 primary로 사용하지 않는다.

필요한 특수 selection action에서만 soft-accent variant 허용:

```text
background  --mw-accent-soft
text        --mw-on-accent
```

### Destructive

```text
background  --mw-danger
text        white
```

현재 고객 flow에서는 매우 제한적.

---

## 15.3 Loading Button

버튼 폭이 Loading 전후로 크게 변하지 않아야 한다.

예:

```text
Book this trip
→ Booking…
→ ✓ Requested
```

spinner를 사용한다면 16px 이하의 작은 indicator.

버튼 전체 중앙에 커다란 spinner만 두지 않는다.

---

# 16. Text Link Primitive

Default:

```text
color       --mw-ink
underline   none
```

Hover:

- underline 또는 underline reveal
- 1px rule

Editorial `Explore →`는 icon/arrow 이동과 함께 사용할 수 있으나
animation 정의는 CP4.

---

# 17. Input Primitive

## Base

```text
min-height    52px
padding-x     16px
background    --mw-surface-elevated
border        --mw-border
radius        12px
text          body-md
```

## Label

```text
14px / 600
margin-bottom 8px
```

## Placeholder

`--mw-text-tertiary`

## Hover

border → `--mw-border-strong`

## Focus

focus ring + border accent.

## Invalid

border danger + helper danger.

## Disabled

muted surface / muted text.

### Form spacing

```text
Label → Field           8px
Field → Helper          8px
Field group → next      20–24px
Section → next          40–48px
```

---

# 18. Select / Combobox Primitive

Visual base는 Input과 동일.

Dropdown menu:

```text
surface     elevated
radius      12px
shadow      elevation-2
item min-h  44px
```

Keyboard navigation 필수.

Native select를 사용하더라도 visual consistency와 접근성을 훼손하지 않는다.

---

# 19. Choice Primitive

## Radio / Checkbox

기본 native semantics를 유지하고 custom visual을 overlay한다.

Touch target:

```text
min 44 × 44px
```

Checkbox visual:

```text
20 × 20px
```

Radio visual:

```text
20 × 20px
```

Selected check/radio mark에 accent 사용 가능.

---

# 20. Option Card / Selector

Tour Style, Hotel, Transport, Meal의 핵심 primitive.

## Compact

```text
min-height    72px
padding       16–20px
radius        14px
border        default
```

## Rich

사진 포함형:

```text
image         96–144px depending context
content       flexible
padding       16–20px
radius        16–18px
```

## Unselected

- surface transparent 또는 normal surface
- border default
- title ink
- metadata secondary

## Hover

- border strong
- subtle surface change
- 필요 시 elevation-1

## Selected

- background accent-faint/soft
- border accent
- selected marker
- title weight 강화

## Invalid combination

Backend가 허용하지 않는 구성이라면:

- 선택 적용하지 않음
- 해당 card 가까이에 이유를 노출
- toast만 띄우고 끝내지 않음

---

# 21. Card Primitives

카드는 목적별로 분리한다.

## Editorial Card

Home / Tours.

특성:

- image first
- border 없음 또는 최소
- shadow 없음
- text는 image 아래 또는 controlled overlay

## Information Card

My Trips / Reservation summary.

특성:

- surface
- subtle border
- moderate radius
- no default heavy shadow

## Floating Summary Card

Configure desktop.

특성:

- elevated surface
- radius-lg
- elevation-2
- sticky positioning
- 정보 density 제한

## Status Card

Error / Empty / Confirmed 등.

status color는 surface tint로 아주 제한적으로 사용.

---

# 22. Image Primitive

공통 prop 개념:

```text
aspectRatio
objectFit
priority
placeholder
radius
overlay
```

## Ratios

권장 presets:

| Name | Ratio |
|---|---|
| `hero-wide` | `16:9` 또는 viewport-led |
| `editorial-portrait` | `4:5` |
| `editorial-wide` | `3:2` |
| `card-landscape` | `4:3` |
| `thumbnail` | `1:1` |

이미지 원본에 따라 지나친 강제 crop은 피한다.

---

# 23. Badge / Status Primitive

## Badge

사용:

- Theme label
- small metadata
- rare category

높이:

```text
24–28px
```

radius-pill 가능.

## Status

상태 표현은 텍스트를 반드시 포함한다.

```text
● Confirmed
```

색상 점 하나만으로 의미를 전달하지 않는다.

### Status examples

```text
Recruiting
Confirmed
Completed
```

실제 상태 enum은 Shared Contract 확정 전까지 UI label 수준으로만 사용.

---

# 24. Recruitment Primitive

이 프로젝트의 signature component.

## General Tour

Recommended primitive:

```text
RecruitmentProgress
├── markers
├── connecting line
├── current count
├── requirement copy
└── status
```

기본 visual:

```text
●────────●────────○
2 / 3 travellers
```

### Marker

- 18–22px visual point
- touch interaction 없음
- confirmed / filled state에 success/accent 사용 가능

---

## Honeymoon

```text
CoupleProgress
├── team slot 01
├── connection
├── team slot 02
├── count
└── confirmation message
```

기본 visual:

```text
Couple 01              Joined
────────────●

Couple 02              Waiting
────────────○

1 / 2 couples
```

사람 icon 4개를 기본 visual로 사용하지 않는다.

---

# 25. Dialog Primitive

## Desktop

```text
width         480–720px depending content
max-height    min(80vh, content)
radius        18–24px
surface       elevated
shadow        elevation-3
padding       28–32px
```

Backdrop:

```text
--mw-overlay
```

Backdrop blur는 필요하면 6–10px 범위로 제한적으로 사용.

## Behavior

- Esc close when safe
- backdrop close when safe
- transaction-critical dialog는 명시적인 action 필요
- focus trap
- focus return

---

# 26. Bottom Sheet Primitive

Mobile:

```text
width        100%
max-height   88dvh
top radius   24px
surface      elevated
```

handle은 decorative이며 label/close를 대체하지 않는다.

사용:

- mobile configuration summary
- mobile previous-travel popup
- selected option detail

---

# 27. Toast Primitive

Toast는 상세 오류 설명의 주 수단이 아니다.

적합:

- lightweight confirmation
- non-blocking success
- copied / minor acknowledgement

부적합:

- reservation submit validation failure
- form field error
- API retry가 필요한 critical failure

기본 위치:

- desktop: top-right 또는 bottom-right
- mobile: bottom safe area 위

CP6에서 화면별 위치를 최종 결정.

---

# 28. Skeleton System

## Base Color

```text
base       #E9E4DC
highlight  #F4F0EA
```

## Radius

실제 target component와 동일.

## Text Skeleton Heights

```text
micro   10px
body    14px
title   20–28px
display screen-specific
```

## Skeleton gap

실제 text line-height보다 약간 넓게.

## Shimmer

방향 / duration / reduced-motion은 CP4에서 정의.

### Requirement

```text
TourCard ↔ TourCardSkeleton
TripCard ↔ TripCardSkeleton
TourHero ↔ TourHeroSkeleton
ConfigurationSummary ↔ ConfigurationSummarySkeleton
```

layout footprint가 최대한 일치해야 한다.

---

# 29. Empty-State Primitive

구성:

```text
optional quiet visual
heading
description
primary/secondary action
```

기본 max-width:

```text
480px
```

Illustration을 사용한다면:

- monochrome / restrained
- cartoon mascot 금지
- 브랜드 사진과 경쟁하지 않음

---

# 30. Error-State Primitive

## Inline/Section error

```text
heading/body
retry action
optional technical reference only if useful
```

Danger soft surface는 제한적으로 사용.

## Full-page error

사용:

- invalid tour
- unrecoverable page data failure

Navigation escape를 항상 제공한다.

---

# 31. Navigation Primitive

## Desktop Global Header

기본 높이:

```text
72px
```

Hero overlay 상태:

```text
transparent
```

Scrolled:

```text
surface with subtle border/elevation
```

## Inner-page Header

```text
64–72px
solid/quiet surface
```

## Mobile Header

```text
56–64px
```

Touch target:

```text
44px minimum
```

---

# 32. Transaction Header

Configure / Reservation:

```text
logo
back/close
minimal utility
```

높이:

```text
64px desktop
56–60px mobile
```

Global discovery nav는 축소한다.

---

# 33. Sticky Action / Mobile Bottom Bar

Mobile Configure / Reservation에서 사용 가능.

```text
min-height     72px + safe-area
padding        12px 20px
background     elevated
border-top     subtle
```

내용:

- concise summary
- primary CTA

전체 화면 높이를 과도하게 가리지 않는다.

---

# 34. Z-Index System

| Token | Value | Usage |
|---|---:|---|
| `z-base` | 0 | normal content |
| `z-raised` | 10 | local overlay |
| `z-sticky` | 20 | sticky summary/header |
| `z-dropdown` | 40 | select/popover |
| `z-header` | 50 | global header |
| `z-backdrop` | 80 | modal backdrop |
| `z-modal` | 90 | dialog/sheet |
| `z-toast` | 100 | toast |
| `z-debug` | 999 | development only |

임의 `9999` 금지.

---

# 35. Accessibility Baseline

## Contrast

일반 text:

- WCAG AA 최소 4.5:1 목표

Large text:

- 최소 3:1

Accent가 contrast 기준을 충족하지 못하면
accent 단독으로 의미를 전달하지 않는다.

## Touch targets

```text
minimum 44 × 44px
```

## Focus

모든 keyboard-interactive element는 visible focus.

## Color

상태는 색 + 텍스트/아이콘 조합.

## Reduced motion

CP4에서 정의하지만 Design System 모든 primitive가
motion이 없어도 의미를 유지해야 한다.

---

# 36. CSS Variable Skeleton

구현 시작점 예시:

```css
:root {
  --mw-canvas: #F6F3ED;
  --mw-surface: #FBF9F5;
  --mw-surface-elevated: #FFFDFC;
  --mw-surface-muted: #EEE9E1;

  --mw-ink: #191918;
  --mw-ink-soft: #34322F;
  --mw-text-secondary: #6E6961;
  --mw-text-tertiary: #918A80;

  --mw-border: #DDD7CE;
  --mw-border-strong: #BDB5A9;

  --mw-accent: #9B7A4B;
  --mw-accent-hover: #87673C;
  --mw-accent-soft: #EEE3D2;
  --mw-accent-faint: #F6EFE4;

  --mw-success: #2F6B50;
  --mw-danger: #A34B44;
  --mw-warning: #9B672F;

  --mw-radius-sm: 8px;
  --mw-radius-md: 12px;
  --mw-radius-lg: 18px;
  --mw-radius-xl: 28px;

  --mw-space-2: 8px;
  --mw-space-4: 16px;
  --mw-space-6: 24px;
  --mw-space-8: 32px;
  --mw-space-12: 48px;
  --mw-space-16: 64px;
  --mw-space-24: 96px;
}
```

실제 구현에서는 이 문서를 기준으로 전체 token map을 구성한다.

---

# 37. Component Naming Guidance

권장 primitive naming:

```text
Button
TextLink
TextField
SelectField
Checkbox
Radio
OptionCard
EditorialCard
InfoCard
StatusBadge
RecruitmentProgress
CoupleProgress
Dialog
BottomSheet
Toast
Skeleton
EmptyState
ErrorState
PageContainer
Section
ImageFrame
```

Domain component에서 primitive를 조합한다.

예:

```text
TourStyleSelector
  └─ OptionCard

TripSummary
  └─ InfoCard

ReservationStatus
  └─ RecruitmentProgress / CoupleProgress
```

---

# 38. No One-Off Styling Rule

다음 구현은 지양한다.

```tsx
<div style={{
  padding: 23,
  borderRadius: 17,
  color: "#2a2929"
}}>
```

허용되는 상황:

- editorial image의 의도된 local offset
- art-directed hero positioning
- 계산형 responsive geometry

그 외 UI는 token을 사용한다.

---

# 39. Visual Density Rules

## Home

density: low

```text
large image
large space
few actions
```

## Tour Detail

density: low → medium

Story section은 낮게,
Style/Schedule section은 중간.

## Configure

density: medium

선택지는 명확하지만 breathing room 유지.

## Reservation

density: medium

검토를 위해 정보 밀도를 올리되
table 느낌은 피함.

## My Trips

density: medium-low

archive / personal library 느낌.

---

# 40. CP3 Decision Log

## D-301 — Warm neutral exact palette fixed

Canvas / Surface / Ink / Border / Accent 값을 확정했다.

## D-302 — Primary CTA is Charcoal

Muted Brass는 primary button color가 아니다.

## D-303 — Theme local accents fixed

Honeymoon / Parents / Golf / Trekking local accent를 제한적으로 사용한다.

## D-304 — Typography pairing fixed

- UI/Korean: Pretendard stack
- Latin editorial accent: Instrument Serif

## D-305 — Type scale fixed

Desktop / Mobile display와 core body scale 확정.

## D-306 — Spacing scale fixed

4px foundation + curated exposed scale.

## D-307 — Container / Grid / Breakpoint foundation fixed

- 1440 wide
- 1280 main
- 12/8/4 column system
- 640 / 768 / 1024 / 1280 / 1440 breakpoints

## D-308 — Radius language fixed

12–18px를 일반 UI 중심으로 사용,
28px는 large editorial surface에 제한.

## D-309 — Default card has no heavy shadow

Spacing / surface / border가 우선.

## D-310 — Buttons and inputs fixed

Primary/Secondary/Quiet + core size/state contract 정의.

## D-311 — OptionCard is a core primitive

Style / Hotel / Transport / Meal 선택을 동일한 selection grammar로 통합.

## D-312 — Recruitment components are Design-System primitives

일반 Tour와 Honeymoon을 별도 primitive로 정의.

## D-313 — Skeleton is paired to real components

Skeleton footprint와 실제 UI footprint를 최대한 동일하게 유지.

## D-314 — z-index scale fixed

임의의 `9999` 사용 금지.

---

# 41. CP3 Acceptance Checklist

## Tokens

- [x] foundation color tokens
- [x] brand accent
- [x] semantic colors
- [x] theme accents
- [x] type family
- [x] type scale
- [x] spacing scale
- [x] container widths
- [x] grid
- [x] breakpoints
- [x] radius
- [x] borders
- [x] shadows
- [x] z-index

## Primitives

- [x] Button
- [x] Text Link
- [x] Input
- [x] Select
- [x] Checkbox / Radio
- [x] Option Card
- [x] Card families
- [x] Image primitive
- [x] Badge / Status
- [x] Recruitment Progress
- [x] Honeymoon Couple Progress
- [x] Dialog
- [x] Bottom Sheet
- [x] Toast
- [x] Skeleton
- [x] Empty State
- [x] Error State
- [x] Global Header
- [x] Transaction Header
- [x] Mobile Sticky Action

## Quality

- [x] focus system
- [x] disabled system
- [x] touch target baseline
- [x] contrast baseline
- [x] one-off styling rule
- [x] visual-density rules

**CP3 Status: COMPLETE**

---

# 42. Next Checkpoint

## CP4 — Motion System

다음 문서:

`05-MOTION-SYSTEM.md`

CP4에서 확정할 것:

- duration tokens
- easing curves
- spring presets
- page transition
- shared-element transition
- Hero reveal
- section reveal
- card hover
- option selection
- live summary update
- number/price change
- recruitment progress
- reservation success
- dialog/sheet
- loading shimmer
- progressive image reveal
- Voice listening / processing / applied
- interruption rules
- reduced-motion behavior
- performance budget
- 금지 animation 패턴

CP3가 정적인 UI의 물리적 규칙을 잠갔다면,
CP4는 그 UI가 **어떻게 움직이고, 언제 멈추고, 어떤 상태 전환을 사용자가 느끼게 할지** 잠그는 단계다.
