# Mister World Frontend Visual Direction

> Document: `03-VISUAL-DIRECTION.md`  
> Status: **CP2 Complete**  
> Scope: `WonhoOne/frontend` Customer GUI  
> Planning baseline: 2026-09-29  
> Depends on: `00-PLANNING-INDEX.md`, `01-PRODUCT-EXPERIENCE.md`, `02-INFORMATION-ARCHITECTURE.md`

---

# 0. CP2 Objective

CP2는 “고급스럽게 만들어라” 같은 추상적 지시를 실제 구현 가능한 **Art Direction / Visual Grammar**로 바꾸는 단계다.

이 문서가 결정하는 것:

- Mister World 고객 GUI가 어떤 브랜드처럼 보여야 하는가
- 어떤 종류의 여행 이미지가 필요한가
- 어떤 화면은 감성적으로, 어떤 화면은 기능적으로 보여야 하는가
- 색상은 어떤 성격을 가져야 하는가
- Typography는 어떤 리듬으로 사용해야 하는가
- Surface / Border / Shadow / Radius는 어떤 성격이어야 하는가
- 사진과 UI의 비중을 어떻게 조절하는가
- Theme별 시각적 차별화는 어디까지 허용하는가
- Mobbin 레퍼런스에서 무엇을 가져오고 무엇은 버리는가
- 구현자가 피해야 할 “학교 과제 느낌”은 무엇인가

정확한 token 값, spacing scale, font size, radius 숫자, motion duration은 CP3/CP4에서 고정한다.

---

# 1. North Star

## Visual identity

> **Cinematic Travel × Luxury Editorial × Modern Product UI**

세 축은 동일 비중이 아니다.

```text
Home / Tour Detail
Cinematic Travel + Luxury Editorial
█████████████████████████

Configure
Luxury Editorial + Modern Product UI
█████████████████████

Reservation / Auth / My Trips
Modern Product UI + restrained Editorial
████████████████
```

즉, 모든 화면을 화보처럼 만들지 않는다.

브랜드를 느껴야 하는 화면은 감성적으로,
결정을 내려야 하는 화면은 정돈되고 기능적으로 만든다.

---

# 2. Brand Impression

사용자가 첫 5초 안에 받아야 하는 인상:

- 여행사가 아니라 **하이엔드 여행 브랜드**
- 기능이 많은 서비스가 아니라 **잘 큐레이션된 4개의 경험**
- 화려하지만 시끄럽지 않음
- 젊지만 가볍지 않음
- 감성적이지만 예약 흐름은 명확함
- 사진이 주인공이지만 UI가 사진 밑에 묻히지 않음

피해야 할 인상:

- Bootstrap 과제
- 항공권 가격 비교 사이트
- 쇼핑몰 카드 나열
- 여행 블로그
- 웨딩홀 홈페이지
- 골드 그라데이션을 남발한 “럭셔리”
- Glassmorphism 도배
- 카드마다 진한 그림자
- 아이콘을 너무 많이 쓰는 대시보드
- 모든 섹션이 둥근 흰 카드 안에 들어간 구조

---

# 3. Visual Hierarchy Model

Mister World의 시각 위계는 다음 순서다.

```text
1. Travel Image
2. Large Editorial Type
3. Primary Choice / CTA
4. Supporting Information
5. Utility UI
```

사진과 타이포가 브랜드를 만들고,
선택 UI가 사용자의 행동을 이끈다.

상태 배지, 보조 설명, metadata는 절대 1~3보다 더 강하게 보이지 않는다.

---

# 4. Color Direction

정확한 HEX / semantic token은 CP3에서 확정한다.

CP2에서는 팔레트의 성격만 고정한다.

## 4.1 Base palette

### Warm Ivory

완전한 `#FFFFFF` 중심 사이트보다
매우 옅은 warm ivory / paper tone을 기본 surface 후보로 삼는다.

목적:

- 여행 사진과 자연스럽게 어울림
- pure white SaaS 느낌을 줄임
- editorial 인쇄물 같은 온도 제공

### Charcoal Black

본문 및 주요 제목은 완전한 pure black보다
깊은 charcoal 계열을 기본으로 검토한다.

### Soft Stone

구분선, inactive surface, skeleton,
secondary surface는 warm gray / stone 계열.

### Champagne / Muted Brass Accent

럭셔리의 표현은 gold gradient가 아니라
**아주 제한적인 warm metallic accent**로 처리한다.

사용 후보:

- selected detail
- small decorative rule
- premium status
- focus moment

금지:

- 본문 텍스트 전체를 금색
- 버튼 전체를 금색 gradient
- 배경 전체를 gold
- glow 효과와 결합

---

# 5. Theme Color Policy

4개 Theme마다 별도 앱처럼 색을 바꾸지 않는다.

공통 Brand System은 유지한다.

Theme 차이는 **사진의 색감 + 제한적인 local accent**로 만든다.

## Honeymoon Romance

Mood:

- dusk
- candlelight
- champagne
- soft ivory
- warm rose undertone

피해야 할 것:

- 진한 핑크
- 하트 도배
- 웨딩홀 브로슈어 느낌

## Parents Healing

Mood:

- warm daylight
- natural wood
- sage / muted green
- cream
- calm hospitality

피해야 할 것:

- 병원/웰니스 클리닉 느낌
- 효도상품 광고처럼 촌스러운 붉은색/금색

## Golf Challenge

Mood:

- deep green
- stone
- cool white
- early morning light
- premium resort

피해야 할 것:

- 스포츠 브랜드처럼 neon green
- scoreboard UI

## Outdoor Trekking

Mood:

- forest
- mineral gray
- overcast sky
- earthy brown
- cool blue

피해야 할 것:

- 캠핑 쇼핑몰
- military / tactical tone

---

# 6. Image Art Direction

사진 퀄리티가 전체 디자인 퀄리티의 절반 이상을 결정한다.

## 6.1 Required characteristics

우선순위:

- 실제 여행 장면처럼 느껴짐
- 인위적인 stock pose가 적음
- 자연광
- cinematic crop
- 넓은 negative space가 있는 이미지
- 인물이 있어도 정면 카메라 포즈보다는 candid
- 호텔 / 식사 / 차량 / 풍경의 material texture가 잘 보임

## 6.2 Cropping

Hero:

- wide landscape
- 사람/중요 피사체를 중앙에 고정하지 않아도 됨
- text safe area를 고려한 crop

Editorial card:

- portrait / landscape 비율을 섞어 리듬 형성

Configurator thumbnail:

- 감성보다 정보 인식이 우선
- 호텔 / 식사 / 차량을 명확히 구분

## 6.3 Image treatment

권장:

- 자연스러운 contrast
- subtle filmic warmth
- overlay는 텍스트 가독성에 필요한 만큼만
- 이미지 위 타이포는 최소화

금지:

- 과도한 blur
- 과도한 vignette
- 모든 이미지에 동일 dark overlay
- Instagram filter 느낌
- AI 특유의 지나치게 깨끗하고 비현실적인 여행 이미지

---

# 7. Typography Direction

정확한 font family는 CP3에서 결정한다.

방향은 **Editorial Display + Neutral UI Sans**의 2계층.

## 7.1 Display type

사용 위치:

- Home Hero
- Tour Detail Hero
- 큰 Section Heading
- 예약 성공의 핵심 메시지

성격:

- 넓은 자간이 아니라 자연스러운 luxury editorial
- 너무 장식적인 serif 금지
- 한글과 영문이 함께 있어도 균형 유지
- 긴 본문에 사용하지 않음

## 7.2 UI / Body type

사용 위치:

- navigation
- option labels
- buttons
- metadata
- forms
- summary
- status
- body copy

성격:

- 매우 읽기 쉬움
- 숫자 가독성 좋음
- 가격 / 날짜 / 모집 상태에서 안정적

## 7.3 Typography rhythm

큰 제목은 크게,
보조 텍스트는 정말 작고 차분하게.

중간 크기 제목이 너무 많아
모든 것이 비슷하게 보이는 구조를 피한다.

예상 hierarchy:

```text
Display Hero
Section Display
Section Title
Card Title
Body
Small Meta
Micro Label
```

---

# 8. Layout Rhythm

## 8.1 Wide breathing room

고급스러운 인상은 card border보다 **여백**에서 만든다.

- 큰 section 사이 vertical rhythm
- container 양쪽 충분한 breathing room
- 이미지 주변에 빈 공간 허용
- 모든 정보를 한 화면에 압축하지 않음

## 8.2 Editorial asymmetry

Home과 Tour Detail 일부 구간은
정렬이 완벽히 대칭인 카드 grid보다
조금 비대칭적인 editorial composition을 사용한다.

예:

```text
┌───────────────┐        ┌───────────┐
│               │        │           │
│   Honeymoon   │        │  Parents  │
│               │        └───────────┘
└───────────────┘

          ┌────────────────────────────┐
          │          Golf              │
          └────────────────────────────┘

┌─────────────────────┐
│      Trekking       │
└─────────────────────┘
```

단, Mobile에서는 선형 구조로 단순화.

## 8.3 Transactional alignment

Configure / Reservation은 asymmetry를 줄이고
정렬과 정보 hierarchy를 우선한다.

---

# 9. Surface Language

## 9.1 Cards

기본 원칙:

> 카드처럼 보이게 하기 위해 그림자를 쓰지 않는다.

카드 구분 방법 우선순위:

1. spacing
2. background contrast
3. subtle border
4. radius
5. shadow — 정말 필요할 때만

## 9.2 Shadow

강한 drop-shadow 금지.

사용 가능:

- floating summary
- modal
- sticky surface가 콘텐츠 위에 올라오는 경우
- hover에서 depth가 필요한 경우

그림자보다 border / blur / background contrast를 먼저 검토한다.

## 9.3 Radius

전체를 pill / bubble UI로 만들지 않는다.

- 큰 이미지: moderate radius
- compact control: smaller radius
- CTA: restrained rounded rectangle
- pill은 tag / status / segmented element에 한정

## 9.4 Glass

Glassmorphism은 signature가 아니다.

허용:

- 이미지 위 floating control
- Home transparent header
- modal backdrop의 아주 제한적인 blur
- Mobile summary overlay

금지:

- 모든 카드
- 모든 navigation
- 모든 button
- 모든 popup

---

# 10. Home Visual Direction

## Goal

첫 화면에서 “과제”가 아니라
실제 여행 브랜드 사이트처럼 느끼게 한다.

## Composition

### Hero

- viewport를 넉넉히 점유하는 이미지
- 한 문장 중심
- CTA 1개 또는 최대 2개
- navigation은 Hero와 자연스럽게 결합

예상 tone:

```text
A journey made
for your moment.

특별한 날,
가장 멋있는 장소에서.

[ Explore Theme Tours ]
```

## Theme section

4개 Theme를 동일한 2×2 상품 카드로 나열하지 않는다.

Editorial image composition 사용.

카드 내 정보는 최소화:

```text
01
Honeymoon Romance
For two, made unforgettable.

Explore →
```

## Reference intent

Mobbin reference:

- Going sections — 여행 이미지와 넓은 여백
- Tripadvisor sections — destination/travel discovery의 정보 밀도
- KOBU / Studio Freight — 비대칭 editorial composition
- SSENSE — restraint와 typography discipline

가져올 것:

- 큰 이미지
- 넓은 공간
- 타이포 대비
- section rhythm

가져오지 않을 것:

- 과도한 e-commerce grid
- 검색 중심 구조
- 작은 카드 다량 배치

---

# 11. Tours Collection Visual Direction

Home보다 기능적이어야 한다.

구성:

```text
Theme Tours
Four ways to travel differently.

[Large Theme Card]
[Large Theme Card]
[Large Theme Card]
[Large Theme Card]
```

각 카드에는:

- strong image
- theme title
- one-line positioning
- available style hint
- minimal CTA

필터 UI는 넣지 않는다.

---

# 12. Tour Detail Visual Direction

## Goal

“상품 설명 페이지”보다
**한 여행을 소개하는 digital editorial**처럼 보이게 한다.

## Hero

- immersive image
- oversized title
- small category label
- 최소 정보

## Story sections

정보를 한 장의 긴 카드에 몰지 않는다.

```text
Image       Copy
     ↓
Copy        Image
     ↓
Full-width visual
```

이런 리듬을 활용.

## Included services

아이콘 3~4개를 줄지어 놓는 여행사 패턴보다
각 서비스가 사진 / 텍스트 / 작은 meta로 의미 있게 보이게 한다.

필요하면 압축된 서비스 list를 보조로 제공.

## Style selector

SaaS pricing table처럼 보이지 않게 한다.

각 Style은:

- 큰 text hierarchy
- hotel grade
- meal baseline
- restrained image/detail
- current selection

을 가진다.

Selected state는 굵은 border 하나로 끝내지 않는다.

---

# 13. Configure Visual Direction

## Goal

여행 감성은 유지하되,
사용자가 “정확히 무엇을 바꾸는지” 한눈에 이해해야 한다.

> Premium product configurator

## Desktop

왼쪽:

- option sections
- selected / unselected state가 명확
- category 사이 충분한 whitespace

오른쪽:

- sticky live summary
- 너무 큰 card shadow 금지
- 작은 이미지 + text summary
- current price / status
- CTA

## Option card

사진이 필요한 경우에도 정보보다 사진이 앞서지 않는다.

Selected:

- surface shift
- subtle accent
- check / state marker
- text emphasis

Unselected:

- calm neutral state

Disabled:

- 단순 opacity 0.3이 아니라
- 왜 선택할 수 없는지 이해 가능한 상태

## Reference intent

Mobbin의 product/configurator류에서 가져올 것:

- left decision area / right summary separation
- sticky summary hierarchy
- quiet form surfaces
- strong final CTA

가져오지 않을 것:

- SaaS pricing visual
- enterprise dashboard density
- 표 형식의 옵션 비교

---

# 14. Schedule & Recruitment Visual Direction

이 프로젝트만의 signature UI 중 하나.

## General Tours

목표:

```text
2 / 3 travellers
```

를 단순 숫자보다 관계로 보여준다.

예:

```text
●────────●────────○
```

또는 고급스럽게 재해석한 participant marker.

Confirmed 시:

- accent fill
- concise confirmation label
- 과도한 confetti 금지

## Honeymoon

사람 icon 4개가 아니라
두 개의 couple/team slot을 사용.

```text
Couple 01      Joined
───────────────●

Couple 02      Waiting
───────────────○
```

이 UI는 Honeymoon의 “2팀이 모여야 출발”이라는 의미를 바로 설명해야 한다.

---

# 15. Reservation Review Visual Direction

## Goal

감성보다 **확신**.

사용자는 “내가 무엇을 신청하는지” 빠르게 검토해야 한다.

색상 사용을 줄이고,
typography / spacing / dividers를 중심으로 한다.

구성:

```text
Trip
Schedule
Configuration
Applicant
Price
Final CTA
```

CTA 이외에 시선을 빼앗는 요소를 최소화.

Mobbin 참고 방향:

- GetYourGuide / Navan booking review
- Expedia package summary

가져올 것:

- checkout hierarchy
- clear summary
- focused CTA

가져오지 않을 것:

- 결제 카드 정보
- 할인 코드
- upsell
- cross-sell

이 프로젝트 범위에 없다.

---

# 16. Reservation Success Visual Direction

## Goal

“성공 체크 아이콘 페이지” 수준을 넘어서
신청 후 다음 상태를 이해시키는 화면.

상단:

```text
Trip requested.
```

또는 한국어 equivalent.

중앙:

- travel identity
- schedule
- recruitment progress

하단:

- View reservation
- Explore more tours

Celebration은 절제한다.

허용:

- line draw
- subtle glow
- check morph
- recruitment completion animation

금지:

- confetti rain
- fireworks
- cartoon illustration

---

# 17. Auth Visual Direction

Auth는 별도 SaaS 서비스처럼 보이면 안 된다.

## Desktop

현재 여행 화면 위에서 열리는 modal-route일 경우:

- background context 유지
- backdrop dim
- restrained blur
- compact form
- strong heading

## Direct URL

왼쪽 visual / 오른쪽 auth form 같은 split layout을 검토 가능.

단, 로그인 하나 때문에 과도한 마케팅 페이지를 만들지 않는다.

## Signup

필드 수가 늘어나도
하나의 긴 Bootstrap form처럼 보이지 않게 section rhythm을 만든다.

---

# 18. Previous Travel History Popup

로그인 직후 보여주는 이전 여행 목록.

목표:

- “팝업 광고”처럼 보이지 않음
- 환영 + 최근 여행의 회상
- history page로 자연스럽게 연결

Desktop:

large editorial dialog.

예:

```text
Welcome back.

Your journeys

[image]  Outdoor Trekking
         Aug 10 — Aug 12
         Grand
         ₩...

[image]  Golf Challenge
         ...

View all trips →
```

Mobile:

full-height sheet.

---

# 19. My Trips Visual Direction

## Goal

차분한 personal archive.

Home처럼 dramatic할 필요는 없지만
여행 사진이 충분히 살아 있어야 한다.

카드:

- travel image
- Theme title
- period
- Style
- price
- relevant status only when contract supports it

Mobbin의 Klook / Expedia / GetYourGuide / TravelPerk에서
trip history의 명확한 정보 hierarchy는 참고하되,
우리 쪽은 card density를 더 낮추고 사진을 더 크게 쓴다.

---

# 20. Navigation Visual Direction

## Home header

Hero 상단에서는:

- transparent
- text color adapts to hero
- minimal chrome

scroll threshold 이후:

- warm solid surface
- subtle border / elevation
- stable navigation

## Inner pages

항상 읽기 쉬운 solid/quiet header.

## Transaction flow

Configure / Reservation:

- navigation reduced
- logo / back / essential utility만 유지
- 사용자가 흐름을 벗어나는 링크는 시각적으로 낮춤

---

# 21. Iconography

원칙:

- line icon
- consistent stroke
- small and functional
- icon이 없어도 이해 가능한 label 유지

피해야 할 것:

- emoji 기반 핵심 UI
- 아이콘마다 서로 다른 스타일
- 장식용 아이콘 과다 사용
- 모든 section title 앞 아이콘

특히 luxury 느낌을 아이콘으로 만들려고 하지 않는다.

---

# 22. Data Loading Visual Direction

Loading도 이 Visual Direction을 따라야 한다.

## Skeleton

- 실제 layout geometry 유지
- warm neutral skeleton surface
- shimmer는 느리고 low-contrast
- Hero skeleton은 화면을 안정적으로 채움
- card skeleton radius가 실제 card와 일치

## Image loading

가능하면:

```text
neutral / dominant placeholder
→ low-detail preview
→ sharp final image
```

이미지가 로딩될 때 scale jump 금지.

## Partial load

Header / navigation / 이미 확보한 text까지
전체 skeleton으로 덮지 않는다.

---

# 23. Empty / Error Visual Tone

## Empty

차분하고 브랜드다운 여백.

작은 illustration을 쓸 수 있지만
cartoon / mascot은 기본 방향이 아니다.

## Error

빨간 경고 상자를 크게 띄우기보다
해당 section 안에서 명확하고 회복 가능한 error message.

Critical error만 별도 full state.

---

# 24. Motion-Compatible Visual Design

CP4에서 Motion을 정의하지만,
CP2부터 visual layer가 motion을 받을 수 있게 디자인한다.

예:

- Card image와 Detail hero의 crop 관계를 맞춰 shared transition 가능
- option selected surface에 moving highlight가 들어갈 공간 확보
- price digits는 고정폭/안정적 layout을 고려
- recruitment line은 fill animation 가능 구조
- modal / sheet는 backdrop과 surface가 분리

즉, 정적인 Figma처럼만 설계하지 않는다.

---

# 25. Reference Matrix

아래 레퍼런스는 “복사 대상”이 아니라 역할별 참고다.

## Home / Editorial

### Going
https://mobbin.com/sites/sections/d0b9722e-3cec-4199-af41-076664bcd032

참고:
- travel-first imagery
- breathable composition

### Studio Freight
https://mobbin.com/sites/sections/c88d7a4b-61f2-4217-8818-80213f9cd809

참고:
- editorial asymmetry
- strong typographic composition

### SSENSE
https://mobbin.com/sites/sections/4de98a06-dbff-4e54-83c6-a301c519bba0

참고:
- restraint
- spacing
- premium typography discipline

## Tour Detail

### GetYourGuide
https://mobbin.com/screens/aa9ebc89-d39f-4c11-92dc-1f9504dd852f

참고:
- experience detail hierarchy
- booking-oriented information structure

### Airbnb
https://mobbin.com/screens/f012d93e-8094-4aac-946e-b9043c870bfd

참고:
- image-led product presentation
- calm action hierarchy

### Klook
https://mobbin.com/screens/60d12b4e-f6ab-4851-9383-18aac0a34293

참고:
- activity/package information density

## Booking Review

### GetYourGuide
https://mobbin.com/screens/66f6475f-f785-49bb-bb75-7b5734caaab8

### Navan
https://mobbin.com/screens/ebb310a2-5242-4fc9-9cb8-a1fcb15f7ab3

참고:
- focused transactional hierarchy
- summary / CTA clarity

## My Trips

### Klook
https://mobbin.com/screens/a07b8446-9afd-43b9-985f-739363fee4a3

### Expedia
https://mobbin.com/screens/b8d770e8-81e7-4417-8e1d-743493f090a1

### GetYourGuide
https://mobbin.com/screens/78a66999-d6c2-4d4c-92ae-d7d39f433ae3

참고:
- trip metadata hierarchy
- archive/list clarity

---

# 26. Explicit Anti-Patterns

구현 시 아래 형태가 나타나면 Visual QA에서 되돌린다.

## AP-01 — Bootstrap assignment

```text
Navbar
Card
Card
Card
Footer
```

모든 화면이 같은 card grid로 끝나는 형태.

## AP-02 — Dashboardification

여행상품 화면에:

- 너무 많은 status chip
- table
- dense metrics
- small icon cards

를 넣어 관리도구처럼 만드는 것.

## AP-03 — Fake luxury

- 금색 gradient
- 반짝이
- 과도한 serif
- black + gold만으로 luxury를 표현

## AP-04 — Excessive glass

모든 surface를 blur glass로 만드는 것.

## AP-05 — Rounded everything

모든 section / button / input / image가 동일한 큰 radius.

## AP-06 — Motion bait

hover만 해도 모든 카드가 크게 들썩이고
페이지마다 다른 easing을 사용하는 것.

## AP-07 — Stock-photo tourism

정면 포즈의 행복한 가족/커플 stock image 위주.

## AP-08 — OTA clone

상단에 대형 검색창을 놓고
호텔/항공/렌터카 tab을 만드는 식의 범용 여행 플랫폼 모방.

---

# 27. Visual QA Questions

각 화면은 구현 후 아래 질문에 답해야 한다.

- 사진이 콘텐츠를 지배하지만 기능을 방해하지 않는가?
- 가장 중요한 CTA가 1초 안에 보이는가?
- 카드가 아니라 spacing으로 hierarchy를 만든 곳이 충분한가?
- unnecessary border/shadow가 없는가?
- Theme의 분위기가 사진으로 구분되는가?
- Gold/Accent가 과도하지 않은가?
- Typography size 차이가 충분한가?
- Mobile에서도 luxury impression이 유지되는가?
- Loading state가 final UI와 같은 디자인 언어인가?
- Empty/Error가 서비스 밖의 임시 화면처럼 보이지 않는가?
- Motion이 들어갈 visual 구조가 확보되어 있는가?

---

# 28. CP2 Decision Log

## D-201 — Visual North Star

**Cinematic Travel × Luxury Editorial × Modern Product UI**

확정.

## D-202 — Warm neutral base

Pure white SaaS보다 warm ivory / charcoal / stone 기반을 채택.

정확한 token은 CP3.

## D-203 — Accent is restrained

Champagne / muted brass 계열 accent는 제한적으로 사용.

금색 gradient 기반 luxury는 금지.

## D-204 — Photography carries theme identity

4개 Theme의 차이는
앱 전체 palette 전환보다 사진과 local accent로 표현.

## D-205 — Two-level typography

Editorial Display + Neutral UI Sans 방향 확정.

정확한 font family는 CP3.

## D-206 — Home uses editorial asymmetry

2×2 동일 카드 grid를 기본으로 하지 않는다.

## D-207 — Detail is digital editorial

Tour Detail은 단순 상품 설명 카드가 아니라
이미지와 copy가 교차하는 storytelling layout.

## D-208 — Configure is a premium product tool

감성보다 정확한 선택과 live summary를 우선,
하지만 SaaS dashboard처럼 만들지 않는다.

## D-209 — Recruitment becomes signature visual

일반 여행과 Honeymoon의 모집 의미를
서로 다른 visual grammar로 표현.

## D-210 — No generic luxury clichés

과도한 gold, glass, shadow, serif, gradient를 금지.

## D-211 — Loading belongs to visual system

Skeleton / progressive image / Empty / Error도
최종 UI와 같은 visual language를 사용.

---

# 29. CP2 Acceptance Checklist

## Brand

- [x] Visual North Star 정의
- [x] Desired / Undesired impression 정의
- [x] Base color direction 정의
- [x] Theme-specific visual mood 정의
- [x] Image art direction 정의
- [x] Typography direction 정의

## Layout

- [x] Editorial asymmetry 규칙 정의
- [x] Transactional alignment 규칙 정의
- [x] Surface / border / shadow / radius 방향 정의
- [x] Glass 사용 범위 정의

## Page Tone

- [x] Home
- [x] Tours
- [x] Tour Detail
- [x] Configure
- [x] Recruitment
- [x] Reservation Review
- [x] Success
- [x] Auth
- [x] Previous History Popup
- [x] My Trips
- [x] Navigation

## Quality

- [x] Loading visual direction
- [x] Empty / Error tone
- [x] Motion-compatible visual structure
- [x] Explicit anti-patterns
- [x] Visual QA checklist
- [x] Mobbin reference matrix

**CP2 Status: COMPLETE**

---

# 30. Next Checkpoint

## CP3 — Design System

다음 문서:

`04-DESIGN-SYSTEM.md`

CP3에서 실제 숫자로 고정할 것:

- exact color tokens
- typography family / size / weight / line-height
- spacing scale
- container widths
- grid
- breakpoints foundation
- radius scale
- border tokens
- shadow/elevation tokens
- icon sizing
- button variants
- input states
- selector states
- card primitives
- dialog / sheet
- badge / status
- skeleton primitives
- focus ring
- disabled states
- z-index / overlay layers

CP2가 “어떤 분위기여야 하는가”를 결정했다면,
CP3는 그 분위기를 개발자가 임의 해석하지 않도록
**Design Token과 Primitive Component 계약**으로 바꾸는 단계다.
