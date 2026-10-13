# CP2-A — Real-Product Reference Research: Evidence Register and Visual-Access Blocker

> **Status: PARTIAL / BLOCKED FOR MOBBIN SCREEN-LEVEL VISUAL PASS.** This is **not a completed CP2-A visual reference audit**, not an approved design direction and not permission to start CP2-B.
> Date: 2026-10-13 (Asia/Seoul). Owner: 김태우 / WonhoOne/frontend.
> Stage chain: P0 #45 merged; CP0-A #46 → CP0-B #47 → CP0-C #48 → CP1-A #49 → CP1-B #50 are **unmerged stacked PRs** at check; this CP2-A branch is based on CP1-B branch. Retarget review PRs to main one at a time after predecessor merge.
> Confirmed scope: **A — Employee PC-only** (2026-10-13). Mobile/tablet layout acceptance not required.
> Sources: [P0 planning program](../00-PLANNING-PROGRAM.md), [Mobbin pre-scout](../references/00-MOBBIN-DISCOVERY.md), [CP1-A](CP1-A-OPERATOR-TASK-FLOWS.md), [CP1-B](CP1-B-INFORMATION-ARCHITECTURE.md), [CP0-B Backend contract audit](CP0-B-BACKEND-EMPLOYEE-CONTRACT-AUDIT.md), [progress ledger](../01-PROGRESS-AND-HANDOFF.md).
> The USER said "다음" after CP1-B. This authorizes CP2-A **research/drafting**; it is not an explicit approval that all unmerged IA proposals/routes have become a final design.

## 0. Research integrity and accessibility boundary

**Required original CP2-A goal:** actually inspect rendered Mobbin **web** screenshots and sequential flows, compare ≥2 apps for Product list, create/edit and Inventory, annotate observable hierarchy/form/dialog/feedback, then make adopt/reject recommendations before CP2-B visual direction.

**Actual availability during this conversation:**
1. The previous Mobbin pre-scout had returned screen/flow IDs, app names, canonical URLs and flow lengths for Shopify, Wix, Square, Uvodo etc. They are verifiable **discovery metadata**, not screenshot inspections.
2. In this session, no connected `Mobbin` tool/action is exposed in available app tools. Plugin discovery for Mobbin returned no installable Mobbin result for this context. This is a **current session accessibility limitation**, not proof Mobbin is permanently unavailable.
3. Public web opening of four pre-scout Mobbin URLs for Shopify/Wix/Uvodo failed with inaccessible results. Hence screenshot appearance, element placement and flow transitions **were not viewed or verified**.
4. We instead researched **public official provider help/documentation** from Shopify, Wix and Square, which provides authentic descriptions of their **business UI operations**, sometimes with screenshots mentioned/embedded. This supports DOCUMENTED INTERACTION FINDINGS, **not direct screenshots**, not a Mobbin visual review.
5. No screenshots were uploaded, fabricated, recreated or claimed viewed. There is **NO CP2-A PASS** and **NO CP2-B art-direction signoff** from this work.

Every note below is labeled:
- `OFFICIAL-DOC VERIFIED`: exact operation described on the provider's official public help page; no claim to have visually inspected images.
- `MOBBIN METADATA ONLY`: prior linked flow name/app/length, no visible frames.
- `UX INFERENCE`: our reasoning for possible relevance to this project's approved scope, **not** a claim about screenshot.
- `VISUAL TBD`: must inspect actual frames before any screen layout or design decision.
- `REJECT CONTRACT-UNSUPPORTED`: observed documented provider operation cannot be imported as a feature because the approved v0.2 Backend has no corresponding operation.

## 1. Mobbin candidate flows retained (NOT VISUALLY INSPECTED)

| Task | Candidate | Previously returned flow metadata | Direct source |
| --- | --- | --- | --- |
| Product create | Shopify short sequence | “Adding a product” / 4 screens | https://mobbin.com/flows/8db969f5-0dc2-4d15-a584-3fb719d63b65 |
| Product create | Shopify expanded sequence | “Adding a product” / 22 screens | https://mobbin.com/flows/9e256ffd-d5a3-4fd2-88bd-a239d491a91b |
| Product create | Wix | “Adding a product” / 16 screens | https://mobbin.com/flows/f3b2a32d-b864-4ece-9289-dfddca06c046 |
| Product create | Ghost | “Adding a product” / 6 screens | https://mobbin.com/flows/69fb23da-1a4d-4d97-8e7d-e546d6e753a2 |
| Inventory | Shopify | “Updating inventory” / 9 screens | https://mobbin.com/flows/cb011e7c-124c-4dd5-91e7-ba76b07cd65c |
| Inventory | Shopify second sequence | “Updating inventory” / 10 screens | https://mobbin.com/flows/6f31b520-0460-4338-962d-0805d862e1c5 |
| Inventory | Uvodo | “Setting quantity” / 4 screens | https://mobbin.com/flows/be749a92-d1ec-4f87-8b6b-3600d5ec1990 |
| Inventory | Uvodo | “Inventory” / 2 screens | https://mobbin.com/flows/05cd9569-a24b-4d65-9e10-38fdf09fd88c |

Individual-screen Mobbin links from pre-scout: [Shopify Product candidate](https://mobbin.com/screens/d9deb551-88bf-4c93-91b3-43ef6659ccef), [Wix Product](https://mobbin.com/screens/f78bf56e-91c7-4ed7-b9af-f6f3a99a0c62), [Square Product](https://mobbin.com/screens/386250b3-cf3d-430e-a486-cd79418add4e), [Square stock](https://mobbin.com/screens/6cb4bb21-dcb4-4b1e-ab38-342a2d4c8b70), [Uvodo stock](https://mobbin.com/screens/4a706510-c67c-4b96-a33c-b36ac9393100). **Do not use these to make pixel-level claims without actual image access.**

## 2. Product list / discovery comparison — official product documentation

| Provider / evidence | OFFICIAL-DOC VERIFIED workflow | UX INFERENCE for Employee | REJECT/DEFER |
| --- | --- | --- | --- |
| [Shopify — Products](https://help.shopify.com/en/manual/products) and [searching/filtering](https://help.shopify.com/en/manual/products/searching-filtering) | Products area is a catalog; staff can view products, add, edit, search/sort/filter; Shopify lists up to 50 per page in its documented product list behavior | A readable Product collection with identifiable item, a prominent Create action and safe edit selection is appropriate. A table is a **candidate**, not chosen by visual evidence | Shopify's vendors, media, variants, bulk edit, stock by SKU, status, marketplace sales channels and advanced search API do not exist in v0.2; do not import these functions |
| [Wix — Product list customization](https://support.wix.com/en/article/wix-stores-customizing-the-product-list-and-saving-your-view) | Wix dashboard Products list has configurable columns, filters, saved views; official article refers to screenshots but this audit did not visually inspect them | Choose a minimal handful of columns actually in our Product response: name, Theme and per-style price summary; optional simple client search only if real catalog size justifies it | Do not build saved views/filtering state or server pagination without verified need/contract. Relevance is **interaction documentation**, not screen-appearance proof |
| [Square — Create/edit Items](https://squareup.com/help/us/en/article/8335-create-and-edit-items) | Square staff navigate through Items to manage item info, name/description/price and types | Two-task separation Products/Inventory plausible, and list→known item is an explicit task | Square item option/category configuration is not a Mister World resource |

**Evidence-backed fact, not layout observation:** all three official services provide explicit catalog-to-edit journeys. Whether our list should use a dense data table vs a simpler row collection, exact column order and action placement is **VISUAL TBD** for CP2-A screenshot inspection and CP6-B.

## 3. Product create/edit comparison — official provider operations

| Provider / evidence | OFFICIAL-DOC VERIFIED sequence | UX INFERENCE | CONTRACT FIT / reject |
| --- | --- | --- | --- |
| [Shopify — Adding & updating products](https://help.shopify.com/en/manual/products/add-update-products) | Desktop create: Products → Add product → enter title/details → Save. Edit: Products → select product name → change details → Save | One recognizable Product context with dedicated Create and Edit task surfaces is reasonable. “Save” should be explicit; after save use server-confirmed data | Shopify product duplicate/archive/publish/status/image/media controls are **outside v0.2** |
| [Shopify — Product details](https://help.shopify.com/en/manual/products/details/product-details-page/) | Title/description, price/media/variants and additional sections described as separate product-detail areas | Name/description and complete allowed prices can be treated as meaningful input groups; do not import irrelevant marketing sections | Exact 2/3 stylePrices by Theme differs from Shopify variants; not interchangeable models |
| [Wix — Adding physical product](https://support.wix.com/en/article/wix-stores-adding-a-physical-product) | Official sequence: first name/description, then Pricing; optional images, inventory, options, modifiers, shipping, subscriptions | Section ordering “Basic information → Prices” is plausible for our short 4-field-type form; could reduce misentry of theme-dependent prices | Wix operates product/variant media/shipping/commerce logic we do not have; Wix notes different generations of its product create page, so **do not claim a single timeless screenshot** |
| [Square — Create/edit items](https://squareup.com/help/us/en/article/8335-create-and-edit-items) | Create Item, choose Item Type; corresponding input fields update; name, price, description and other attributes | Theme choice changing allowed Style price group is **analogy only**, not a copied “item type” implementation | Square category/price/SKU/stock side-fields are not our API; right-column placement documented but not visually inspected in this session |

**Screen validation TODO**: Compare at least two actual rendered sequences side by side for (a) title/action hierarchy, (b) form width and section boundaries, (c) save position, (d) inline error/focus handling, (e) success return, (f) edit value retention, (g) theme-dependent 2/3 prices and an explicit 409 recovery we must design ourselves. Provider help articles do **not** establish their screenshot-level error patterns.

## 4. Inventory read/add — decisive contract distinction

| Provider / evidence | OFFICIAL-DOC VERIFIED workflow | What aligns with our backend? | What conflicts? |
| --- | --- | --- | --- |
| [Shopify — Adjusting inventory quantities](https://help.shopify.com/en/manual/inventory-and-locations/adjusting-inventory/adjusting-inventory-quantities) | Clearly distinguishes **Set to** = overwrite final quantity versus **Adjust by** = increase/decrease delta. Inventory page permits reviewing pending changes and applying Save; the provider stores an adjustment history | **Only the ADD/POSITIVE portion of “Adjust by”** resembles our POST `{itemType, quantity >0}`. Can research how they distinguish current vs adjustment amount | We **cannot** copy “Set to”, decrease/remove, inventory locations, pending batch operations or audit history — absent API |
| [Wix — Updating inventory](https://support.wix.com/en/article/wix-stores-updating-inventory) | Inventory dashboard lets merchant enter a **new** inventory amount (and handles location/SKU/filtering) | A clearly visible current balance could help our read task; no conclusion on placement | **DIRECT SEMANTIC CONFLICT**: our POST is additive; do NOT copy Wix's absolute new-quantity interaction, even if visual layout is attractive |
| [Square — View, receive and adjust inventory](https://squareup.com/help/us/en/article/6110-manage-inventory-with-the-retail-pos-app) | Distinguishes **Receive stock** from adjustment; Square Dashboard provides Stock Overview and item-level stock actions, using an “On hand” popover | Explicit **receiving** intent matches our add-only task; same Inventory context is a plausible option | Square inventory recount, damage, theft, transfers, locations, vendor, history and outflow are not part of v0.2 |
| [Square — Adjust inventory levels](https://squareup.com/help/us/en/article/8331-set-up-inventory-tracking) | Dashboard `Manage stock` modal and documented keyboard navigation between variations/locations | Keyboard navigability in stock edits is an accessible interaction idea; current Employee scope is desktop-only | Multiple location/variation and stock set abilities are not supported; modal geometry **VISUAL TBD** |

**Provisional UX principle derived from contract + provider docs, not Mobbin screenshots:**

```text
[Item name] [Current total: 10]
             [Quantity TO ADD: 5]  [Confirm Add]
Backend POST {itemType, quantity:5}
200 → display server-provided new total (e.g. 15), re-read as appropriate.
Timeout/unknown → DO NOT automatically send another POST; show uncertain result.
```

This is a **semantic example**, not an approved wireframe, UI layout or claim that official providers render these exact elements in this order. **Critical:** even a fresh GET showing a different balance cannot prove a timed-out POST succeeded when concurrent staff updates are possible, because API has no idempotency key or movement ledger.

## 5. Comparison summary — evaluate patterns, do not clone

| Candidate principle | Task | Evidence | Contract fit | Decision NOW |
| --- | --- | --- | --- | --- |
| Product list → Create/Edit | Browse/manage products | Official Shopify/Wix/Square workflows | Good | **Keep as functional IA hypothesis**, not layout approval |
| Group name/description apart from pricing | Product editor | Official Wix/Shopify sections | Good | **Evaluate visually at CP2-A**, then CP6 form specification |
| Dynamic options depending on product type | Theme-dependent prices | Official Square item-type behavior (analogy) + our BR-17/21 | Domain fit with care | **Conceptual candidate** only |
| Positive additive quantity, explicitly distinguished from total | Stock add | Shopify Adjust by; Square Receive stock | **Strong** | **Contract-required distinction; visual design pending** |
| Direct absolute stock overwrite | Stock management | Wix inventory, Shopify Set to | **Forbidden** | **Reject** |
| Admin analytics dashboard | Entry | Larger provider applications | No approved data or task | **Reject for v0.2** unless team changes scope |
| Location/vendor/SKU/variants/sales channels/bulk edit | Product/Inventory | Full-commerce platform docs | No approved endpoint | **Reject** |
| Modal for stock addition | Inventory | Square stock modal described | Possible | **VISUAL TBD**; compare with inline simple form |
| Server paginated catalog / saved filters | Product list | Shopify/Wix larger-scale docs | Not in employee API | **Defer/reject** until actual scale/API agreement |
| Role, keyboard and 401/403 recovery | Cross-cutting | Our actual security contract + desktop scope | Required | **Cannot be decided from Mobbin**; CP5/6/7 |

## 6. Exactly what is still missing for a CP2-A PASS

The original planning program requires **visual inspection** of real reference screens and multi-screen transitions. Every item below is **NOT DONE**:

- [ ] Actual screenshots from **at least two** products-list UIs viewed and compared: information density, hierarchy, table vs rows, action placement, loading/empty feedback.
- [ ] Actual screenshots from **at least two** create/edit UIs viewed and compared: grouping, navigation, save location, validation/error and dirty-change handling.
- [ ] Actual screenshots from **at least two** inventory UIs viewed and compared: current-vs-added distinction, confirmation, updated balance, keyboard focus; reject absolute-set semantics.
- [ ] Evidence cards with app, canonical Mobbin or official screenshot URL, date, screen sequence/step, **observed image details** distinguished from inferred ideas, fit and rejection.
- [ ] Re-evaluate candidate screenshot currency/version (especially Wix product editor rollout) and desktop relevance.
- [ ] Reconcile final visual pattern candidates with **real current Customer design tokens/primitives** without assigning visual language prematurely.
- [ ] CP1-B proposed IA-01..IA-05 owner review/approval and prior #46–#50 dependency merges.
- [ ] Only then mark `CP2-A PASS`; only thereafter start `CP2-B` design direction.

**How to unblock:** In a future session with the Mobbin connection/action available, directly inspect the exact retained flow/screens above and write visual observation evidence cards. Alternatively use a screenshot-upload/browser-capable session with access to those Mobbin links and preserve the same verification protocol. Do **not** convert provider help center descriptions into “visually observed Mobbin pattern.”

## 7. Checkpoint audit and handoff

### What was achieved

- [x] Verified legacy Mobbin pre-scout links and attempted to open actual Mobbin flow pages.
- [x] Recorded that the Mobbin connector is **not available in current session** and direct flow pages could not be opened.
- [x] Compared genuine official documentation from **Shopify, Wix and Square** in catalog, product create/edit and stock management (3/3 tasks covered by ≥2 primary providers).
- [x] Distinguished official documented behavior from UI inference and screenshot visual unknowns.
- [x] Identified an important **contract mismatch**: Wix new-total quantity editing vs our additive-only API; clarified Shopify Set to vs Adjust by.
- [x] Collected retained Mobbin URLs and precise unfinished image-level research tasks.
- [x] Did **not** claim screenshot access, CP2 completion, approved style, UI implementation or test execution.

### Current gate

`CP2-A = IN PROGRESS / VISUAL EVIDENCE BLOCKED.`
This source comparison is a **useful partial output**, not a substitute for actual Mobbin visual inspection. **Do not proceed to CP2-B as if CP2-A passed.**

**New-chat instruction:** First review the [progress ledger](../01-PROGRESS-AND-HANDOFF.md), actual #46–#50 + this PR status and approved docs/main. Then finish CP2-A actual screenshot inspection with a connected Mobbin tool or browser-capable session. Review/approve CP1-B if not yet done. Append visual evidence cards and adjust the comparison matrix, then update ledger `CP2-A PASS` only on committed proof and owner gate. No employee UI code until P1 CP11.
