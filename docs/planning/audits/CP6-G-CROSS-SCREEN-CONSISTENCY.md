# CP6-G — Cross-Screen Consistency Audit

> Status: **COMPLETE**  
> Date baseline: 2026-09-29  
> Scope: CP0–CP5 planning documents + all 11 CP6 Screen Specs

---

## 1. Audit Method

검사 항목:

- route / navigation
- Screen ownership
- Theme / Style / Configuration semantics
- Honeymoon / general departure semantics
- CTA and Back behavior
- Login / post-login behavior
- Reservation vs Travel History separation
- Loading / Empty / Error / Retry
- Motion primitive naming
- Header / component primitive reuse
- Mobile/Desktop transformation
- Shared Contract boundary
- 20-section Screen Spec completeness

11개 screen 문서 모두 mandatory section `1–20`을 갖는 것을 확인했다.

---

## 2. Result Summary

```text
11 / 11 screen specs structurally complete
8 consistency defects corrected
0 known unresolved cross-screen contradiction
12 contract/TBD families intentionally unresolved
```

CP6-G 이후 남아 있는 미확정 사항은 Screen Spec 간 모순이 아니라
Shared Contract 또는 팀 결정을 기다리는 항목이다.

---

## 3. Corrected Defects

### G-01 — Route drift

`00-PLANNING-INDEX.md`에 남아 있던:

```text
/my-trips/:reservationId
```

를 제거했다.

Canonical current reservation detail route:

```text
/reservations/:reservationId
```

Travel History는 `/my-trips`.

---

### G-02 — My Trips scope drift

초기 Product Experience에 남아 있던:

```text
My Trips = Calm account dashboard
Recruiting / Confirmed / Completed
```

표현을 최신 IA와 Screen Spec에 맞췄다.

Canonical:

```text
My Trips
= calm personal travel archive
= historical Travel History
= recent-first
```

현재 신청 상태:

```text
Reservation Detail
```

---

### G-03 — Previous Trips Popup list semantics

초기 single recent-trip 예시와
CP6-F의 `최근 N개 preview` 제안을 정리했다.

Canonical:

```text
login success
→ previous Travel History list
→ recent-first
→ long list scrolls inside dialog/sheet
```

`View all trips`는 full-page archive navigation.

---

### G-04 — Unsupported My Trips detail route

History item dedicated detail route/API가 없으므로
My Trips card를 Reservation Detail에 임의 연결하지 않는다.

CP1 transition intent와 CP4 route motion에서도
해당 active transition을 제거했다.

---

### G-05 — Reservation Review party-field overreach

`Participant / Team information`을
확정된 Reservation form field처럼 표현하지 않도록 수정했다.

현재 canonical rule:

```text
Recruitment / party context
→ only when Shared Contract exposes it
```

---

### G-06 — Reservation Detail applicant overreach

Applicant summary:

```text
only when Reservation contract exposes it
```

으로 정리했다.

---

### G-07 — Motion primitive naming

다음 drift를 canonical CP4 명칭으로 정리했다.

```text
Standard Detail Transition
→ Standard Forward Page Transition

Button Loading / Success Motion
→ Button Motion — Loading / Success

Recruitment Progress Motion
→ General Recruitment Progress Motion
  or Honeymoon Couple Progress Motion

Progressive Image Reveal
→ Image Loading Motion — Progressive load
```

---

### G-08 — Header primitive naming

```text
MinimalHeader
→ TransactionHeader (completion variant)

AccountHeader
→ GlobalHeader (authenticated state)
```

새 Design-System primitive를 근거 없이 만들지 않도록 통일했다.

---

## 4. Verified Cross-Screen Contracts

### Customer route chain

```text
/
→ /tours
→ /tours/:tourId
→ /tours/:tourId/configure
→ /reservation/review
→ /reservation/:reservationId/success
→ /reservations/:reservationId
```

Account routes:

```text
/login
/signup
/my-trips
```

### Product decision chain

```text
Theme
→ Style
→ Schedule
→ Configuration
→ Review
→ Application
```

### Tour Style restrictions

```text
Honeymoon  Grand / Premium
Parents    Grand / Premium
Golf       Classic / Grand / Premium
Trekking   Classic / Grand / Premium
```

### Departure semantics

```text
Honeymoon:
2 couples / 2 teams

Other Themes:
3 participants
```

### Travel History

```text
recent-first
product
period
Tour Style
price
```

### Data-state behavior

```text
Loading    skeleton-first
Partial    successful content preserved
Error      localized where possible
Retry      localized
Refresh    existing content retained
Offline    cached/stale state explicit
```

### Reservation safety

```text
Submit = pessimistic
duplicate submit = blocked
401 = login + draft restore, no auto-resubmit
409/change = explicit reconfirmation
success = server-confirmed only
```

---

## 5. Open Items Carried to CP6-H

These are **not inconsistencies**. They are explicit contract gaps.

1. Auth credential / token / session / refresh model
2. Reservation authentication gate
3. Tour DTO
4. TourSchedule DTO / status / availability
5. TourConfiguration / option DTO
6. Reservation DTO / error schema / status enum
7. Travel History DTO / canonical date / item ID / pagination
8. Price formula / option price delta
9. Frequent-customer discount
10. Actual Hotel / Transport / Meal / Extra option catalogs and compatibility
11. Voice final commands / payload
12. Confirmation notification mechanism and transaction-time history-popup timing

CP6-H의 목적은 이 항목들을
`TBD / BLOCKED / FRONTEND PROPOSAL` 수준에서 끝내지 않고,
어떤 팀/문서/계약이 무엇을 결정해야 구현이 unblock되는지 정리하는 것이다.

---

## 6. Exit Criteria

- [x] 11개 Screen Spec 20-section 구조 검증
- [x] route drift 제거
- [x] My Trips / Reservation Detail 책임 재검증
- [x] Previous Trips Popup 원본 요구와 정렬
- [x] Honeymoon / general 모집 semantics 통일
- [x] Style / Schedule / Configure 순서 통일
- [x] Loading/Error/Retry 전략 통일
- [x] Motion naming canonicalization
- [x] Header primitive canonicalization
- [x] Transaction draft / submit safety 통일
- [x] unresolved contract gap을 contradiction과 분리

**CP6-G COMPLETE**
