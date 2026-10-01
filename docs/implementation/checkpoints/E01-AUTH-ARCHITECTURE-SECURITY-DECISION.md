# Session E — Auth Architecture & Security Decision

> Status: **LOCKED**
> Checkpoint: **E01 — Auth architecture/security decision**
> Date: **2026-10-01**
> Owner: **Session E — Account & Travel History**
> Frontend base: `WonhoOne/frontend@1ce1427596aa70ac61ab2f7c50a066e502f98c79`
> Shared Contract: `WonhoOne/docs@79955fc9c864ad0efce6dee9db2319e684573e7a` — **Baseline v0.2**
> PR target: **PR-07 / feat/account-auth**

## 1. Precedence and superseded planning

Shared Contract v0.2 is the SSOT for Session E.

Older Frontend planning text that says Auth is BLOCKED, credential fields are TBD, Travel History DTO is TBD, or JWT assumptions are forbidden is superseded where v0.2 has closed those contracts.

CP8 security principles remain applicable unless they depended on the old H-04 block.

## 2. Approved v0.2 authentication contract

Customer authentication uses a JWT Bearer Access Token.

Login request:

```text
loginId
password
```

Login success:

```text
200 OK
accessToken
tokenType = Bearer
expiresIn (seconds)
user:
  id
  role
  name
```

Signup request requires:

```text
loginId
password
name
address
contact
```

Signup success is `201 Created` and returns:

```text
id
role = CUSTOMER
name
```

Signup does **not** issue an access token and must not auto-login.

v0.2 has no refresh token, refresh endpoint, or logout endpoint.

Public signup is CUSTOMER-only. Employee provisioning is outside Customer Frontend scope.

Stable error codes, not Backend message parsing, drive client flow.

## 3. Frontend-local auth session decision

### E01-D01 — Access Token is memory-only

PR-07 stores the Access Token only in the Auth runtime's JavaScript memory.

It is not persisted in:

```text
localStorage
sessionStorage
TanStack Query cache
ReservationDraft
ReturnContext
URL/query parameters
logs
analytics/error payloads
```

Rationale:

1. CP8 classifies access tokens as SENSITIVE AUTH and prefers no JavaScript-readable persistent token storage without explicit approval.
2. v0.2 makes token storage Frontend-local, so Session E must now choose deliberately rather than remain BLOCKED.
3. There is no refresh-token/refresh-endpoint contract in v0.2.
4. The approved authenticated UI summary is `id/role/name`, but CP8 prohibits persistent Customer profile storage.
5. No approved Customer `/me` bootstrap contract is available for PR-07 to reconstruct that summary after reload.
6. Persisting only the JWT and decoding uncontracted JWT claims would invent a claim contract.
7. Therefore memory-only storage minimizes persistent bearer-token exposure and does not require inventing a session-recovery API or JWT payload schema.

### E01-D02 — Reload ends the local authenticated UI session

A full document reload loses the memory-only token and authenticated user summary.

Auth bootstrap transitions:

```text
checking
→ unauthenticated
```

unless a future approved live-integration contract provides a safe bootstrap mechanism.

PR-07 must not silently recover authentication from an unapproved persistent token, cookie, JWT claim decoder, or invented endpoint.

This is a deliberate Frontend-local UX/security tradeoff for v0.2, not an implementation accident.

### E01-D03 — AuthState shape

Minimum application state:

```ts
type AuthState =
  | { status: 'checking' }
  | {
      status: 'authenticated';
      user: {
        id: number;
        role: 'CUSTOMER';
        name: string;
      };
    }
  | { status: 'unauthenticated' };
```

The token is private Auth runtime state and is not exposed as ordinary UI state.

No Redux/Zustand dependency is added. Auth is application-level Context.

### E01-D04 — Expiry handling

`expiresIn` is seconds.

On successful login, the Auth runtime computes an in-memory expiry deadline from the receipt time and `expiresIn`.

At or after expiry:

```text
authenticated
→ unauthenticated
→ clear private query cache
```

An `ACCESS_TOKEN_EXPIRED` or `INVALID_ACCESS_TOKEN` result from an authenticated operation causes the same transition.

Clock/timeout handling must be testable through injected time/timer boundaries or equivalent deterministic tests.

No refresh attempt is made because v0.2 has no refresh contract.

### E01-D05 — Explicit local sign-out is state clearing, not a Backend logout call

If UI needs a sign-out action, PR-07 may clear local Auth runtime state and private cache.

It must not call or invent `/logout`.

## 4. Credential and private-data boundary

Credential state exists only in Login/Signup component-local form state.

Never persist or log:

```text
password
raw login credential state
contact
address
access token
raw auth response
raw private API payload
Travel History
```

`loginId` is an authentication credential input and is not persisted as form recovery state.

Authenticated UI state contains only the v0.2-approved summary:

```text
id
role
name
```

## 5. Private query-cache lifecycle

On transition to `unauthenticated`, clear private server state including:

```text
Travel History
Reservation Detail
future customer-specific queries
```

Preserve:

```text
public TourProduct/query data
static/editorial data
ReservationDraft
non-sensitive ReturnContext needed for auth interruption
```

Private query data remains memory-only. No persistent TanStack Query cache is introduced.

The concrete private-query key registry/removal API is implemented in E02/E09 without coupling Auth to feature-private implementations.

## 6. ReturnContext boundary

ReturnContext is navigation context, not an auth/session store.

Approved shape:

```text
schemaVersion
returnTo
intent
draftSchemaVersion
createdAt
```

Persistence:

```text
memory
+ sessionStorage fallback
key = mister-world:return-context:v1
```

It must never contain credentials, access token, auth response, address/contact, private payload, or Travel History.

Only app-owned internal routes are accepted. External/protocol-relative/executable URLs are rejected.

Detailed parser/expiry/schema compatibility implementation belongs to E05.

## 7. Mock/live boundary

PR-07 remains Mock-backed.

Architecture:

```text
Auth feature
→ AuthDataSource port
→ Mock implementation
```

PR-07 must not add live:

```text
fetch /api/v1/auth/login
fetch /api/v1/auth/signup
JWT Backend adapter
refresh endpoint
logout endpoint
```

IMP-6 / PR-09 owns live Backend integration.

The memory-only session decision is transport-independent so the Mock DataSource can be replaced later without rewriting Login/Signup UI.

## 8. Session D boundary

At E01, frontend main has no public PR-06/Reservation Journey seam available.

Session E therefore:

- does not deep-import Session D private code;
- does not guess Reservation internal APIs;
- builds Auth/ReturnContext independently;
- uses a synthetic/public-boundary integration test until D's public authentication-required seam reaches main;
- reconnects only through that public seam during Transaction Login Recovery.

Login success must never automatically submit a Reservation.

ReservationDraft survives auth loss.

Transaction return has priority over Previous Trips post-login presentation.

## 9. Security invariants for implementation checkpoints

E02+ must preserve these invariants:

- no token in localStorage/sessionStorage;
- no credential persistence;
- no raw auth/private payload logging;
- no JWT claim assumptions;
- no refresh/logout endpoint invention;
- stable error-code handling only;
- private cache clear on auth loss;
- ReservationDraft retained;
- ReturnContext contains no secret/private payload;
- production mocks remain explicit opt-in and off for production;
- no new auth/state-management dependency without a separate dependency gate.

Security-sensitive storage, expiry, redirect validation, cache clearing, and mock guards require WHY comments per CP8.

## 10. E02 implementation contract

E02 may now implement:

```text
src/features/auth/**
AuthDataSource port
MockAuthDataSource
AuthProvider / useAuth public API
memory-only access-token holder
in-memory expiry lifecycle
stable auth error normalization
private-cache clear integration boundary
AppProviders composition
unit/integration tests
```

E02 must not implement Login/Signup screen polish beyond what is necessary to exercise the public Auth API.

## 11. E01 validation checklist

- [x] frontend main SHA rechecked
- [x] Shared v0.2 precedence rechecked
- [x] CP3 Auth/ReturnContext/private-cache architecture reviewed
- [x] CP8 storage/security rules reviewed
- [x] Session D public availability rechecked
- [x] token persistence decision made explicitly
- [x] reload behavior defined
- [x] expiry behavior defined
- [x] credential/private-data boundary defined
- [x] private-cache lifecycle defined
- [x] Mock/live boundary defined
- [x] Session D ownership boundary defined
- [x] E02 implementation contract defined

## 12. Exit status

```text
E01 — AUTH ARCHITECTURE / SECURITY DECISION
STATUS: COMPLETE

Access Token storage       MEMORY ONLY
Reload auth recovery       NOT INVENTED; returns unauthenticated
Refresh mechanism          NONE in v0.2
Credential persistence     FORBIDDEN
Private Query persistence  FORBIDDEN
ReturnContext persistence  MEMORY + sessionStorage fallback
ReservationDraft auth loss PRESERVED
Live Auth HTTP             DEFERRED TO IMP-6 / PR-09
Session D private coupling FORBIDDEN
```
