# Mobbin Pre-Scout — Employee Console Reference Candidates

> Status: **DISCOVERY COMPLETE; VISUAL AUDIT NOT YET COMPLETE**
> Date: 2026-10-13
> Source: Connected Mobbin search for **web** screens and flows.
> Destination: Employee Console planning program; references are **research candidates**, not approved designs.
> Scope: TourProduct list/create/edit, positive stock addition, employee administrative shell, success/error feedback.
> Next action: CP2-A, visual inspection and comparison, after CP0/CP1 scope and IA are established.

## 1. What was actually researched

Four distinct screen queries and two flow queries were run:

1. Product-management list with category/price/create action.
2. Product editing form with details/category/price/save.
3. Inventory-management table with current quantity and stock-add operation.
4. Business-app shell with sidebar, management views and account menu.
5. A multi-step product creation journey.
6. A multi-step inventory adjustment journey.

The connected Mobbin result identified real **app names, canonical Mobbin screen/flow URLs and flow length**. This runtime did **not** provide a satisfactory way to visually inspect full rendered screen images from the resulting URLs. Therefore the tables below record verified **discovery metadata** and intended investigation only; there are **no fabricated layout, typography, interaction or usability findings**.

## 2. High-value multi-screen journeys to inspect at CP2-A

| Priority | Candidate (direct Mobbin link) | Verified query result | Why inspect (hypothesis, not an observation) |
| --- | --- | --- | --- |
| 1 | [Shopify — Adding a product, 4-screen flow](https://mobbin.com/flows/8db969f5-0dc2-4d15-a584-3fb719d63b65) | Shopify / Adding a product / 4 screens | Compact creation flow and save completion |
| 1 | [Shopify — Adding a product, 22-screen flow](https://mobbin.com/flows/9e256ffd-d5a3-4fd2-88bd-a239d491a91b) | Shopify / Adding a product / 22 screens | Expanded workflows and optional complexity to **exclude** if excessive |
| 1 | [Shopify — Updating inventory, 9-screen flow](https://mobbin.com/flows/cb011e7c-124c-4dd5-91e7-ba76b07cd65c) | Shopify / Updating inventory / 9 screens | Distinguishing changed quantity from current quantity, mutation feedback |
| 1 | [Uvodo — Setting quantity, 4-screen flow](https://mobbin.com/flows/be749a92-d1ec-4f87-8b6b-3600d5ec1990) | Uvodo / Setting quantity / 4 screens | Compact stock adjustment vs the project's **addition-only** API |
| 2 | [Wix — Adding a product, 16-screen flow](https://mobbin.com/flows/f3b2a32d-b864-4ece-9289-dfddca06c046) | Wix / Adding a product / 16 screens | Alternative product-entry structure |
| 2 | [Shopify — Updating inventory, 10-screen flow](https://mobbin.com/flows/6f31b520-0460-4338-962d-0805d862e1c5) | Shopify / Updating inventory / 10 screens | Additional comparison for stock editing pitfalls |
| 3 | [Ghost — Adding a product, 6-screen flow](https://mobbin.com/flows/69fb23da-1a4d-4d97-8e7d-e546d6e753a2) | Ghost / Adding a product / 6 screens | Minimal/alternative editor pattern |
| 3 | [Uvodo — Inventory, 2-screen flow](https://mobbin.com/flows/05cd9569-a24b-4d65-9e10-38fdf09fd88c) | Uvodo / Inventory / 2 screens | Inventory overview candidate |

## 3. Individual screen candidates to inspect at CP2-A

The following are canonical Mobbin screen URLs returned from query results (the descriptive roles are **search intent**, not verified screenshot descriptions):

| Query role | Candidate | Source |
| --- | --- | --- |
| Product list | Square | [Mobbin Square screen](https://mobbin.com/screens/386250b3-cf3d-430e-a486-cd79418add4e) |
| Product list | Shopify | [Mobbin Shopify screen](https://mobbin.com/screens/d9deb551-88bf-4c93-91b3-43ef6659ccef) |
| Product list | Wix | [Mobbin Wix screen](https://mobbin.com/screens/f78bf56e-91c7-4ed7-b9af-f6f3a99a0c62) |
| Editor | Podia | [Mobbin Podia screen](https://mobbin.com/screens/75e67c25-bbb3-42b0-95d2-1346751fd23b) |
| Editor | Square | [Mobbin Square editor candidate](https://mobbin.com/screens/d3a0e4b3-c9d9-4f80-9262-460bb4be7608) |
| Stock | Uvodo | [Mobbin Uvodo screen](https://mobbin.com/screens/4a706510-c67c-4b96-a33c-b36ac9393100) |
| Stock | Square | [Mobbin Square stock candidate](https://mobbin.com/screens/6cb4bb21-dcb4-4b1e-ab38-342a2d4c8b70) |
| Shell | Square | [Mobbin Square shell candidate](https://mobbin.com/screens/ef5d985b-ff12-4c83-aea2-20e22a1ab2bf) |
| Shell | Google Workspace | [Mobbin Workspace shell candidate](https://mobbin.com/screens/bb4d7f66-148a-4b86-829c-0f43a2d0b21d) |

These examples are **not** recommendations to duplicate brand UIs or their functionality.

## 4. CP2-A mandatory visual research protocol

For each relevant candidate selected:

1. Open actual Mobbin reference and **visually review the individual screens/flow transitions**, not only the title/metadata. If the connected tool cannot surface viewable images, request a browser-capable session/user-provided screenshot or use another verifiable primary source; do not claim inspection happened.
2. Make an evidence card with **canonical URL, app, date, verified screenshot observations** (section order, navigation, visual density, fields, primary actions, cancel/save, validation, feedback) and **rejected assumptions**.
3. Compare at least **two materially different products per main task** (catalog, editor, inventory) where accessible; add a third where patterns conflict.
4. Label `OBSERVED` vs `INFERRED` vs `UNVERIFIED`; cite the source at the moment of decision.
5. Extract reusable interaction principles, not surface cloning. Check differences from Mister World: only Theme, name, description and complete allowed TourStyle prices for Product writes; only fixed 4 inventory types and **additive** stock mutation.
6. Assess whether desktop table/form flows outperform cards/sheets for the actual small data model. Don't invent dashboard metrics or widgets just because a reference shows them.
7. Compare findings against the **actual** existing Customer frontend design tokens, primitives and brand. Document reuse/extension/new component rationale.
8. Produce a brief **comparison matrix** (reference → observed pattern → task fit → contract fit → implement/reject/defer) and an explicit `CP2-A PASS` only after visual evidence exists.

## 5. Safety/quality exclusions

- Mobbin flow labels alone do not prove a screen has a specific layout.
- Do not paste or redistribute screenshot files; use canonical Mobbin links for citations. Avoid saving expiring image links as long-lived docs references.
- Any company-specific product management features beyond shared v0.2 are **not in scope** without contract/owner approval.
- Mobile UI examples do not automatically establish employee mobile support. The device policy is decided in CP0-C.
- The current discovery is **before** the visual research gate. Mark CP2-A as `PENDING`, not complete.

## 6. Findings at P0 only

**Verified:** Mobbin has discoverable web flows for adding products (Shopify, Wix, Ghost) and updating/setting inventory (Shopify, Uvodo), with directly openable canonical Mobbin URLs; screen search also surfaces Square, Shopify, Wix, Podia and similar business-product examples.

**Not verified:** The detailed visuals, layout mechanics, interaction semantics, keyboard UX, error recovery and suitability of any candidate to our customer design system.

**Planning implication:** A dedicated **visual reference comparison checkpoint** must precede final art direction and screen layout decisions. That is why CP2-A exists in the planning program.
