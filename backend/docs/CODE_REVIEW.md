# Arefriz — Senior Engineer Code Review

**Type:** Descriptive code review, read-only. No code was modified to produce this document.
**Companion docs:** `docs/PROJECT_AUDIT.md` (file inventory, duplicates, dead code), `docs/SYSTEM_DESIGN.md` (flows/diagrams), `docs/DATABASE.md` (schema deep-dive). This document focuses on **code-quality judgment calls** across the ten categories requested, each finding tagged with a severity.

**Severity definitions used throughout:**
- **Critical** — actively broken, actively exploitable, or capable of silently corrupting data/money figures in production today.
- **High** — a real defect or risk that should be fixed soon; not yet catastrophic but a plausible near-term incident.
- **Medium** — a genuine quality/risk issue with bounded impact; fix in the normal course of work.
- **Low** — hygiene/polish; low urgency, cheap to fix when touching the area anyway.

---

## Severity Summary

| Severity | Count | Theme |
|---|---|---|
| Critical | 5 | Committed secrets, credential/token logging, admin login broken, dead-fork DB corruption risk |
| High | 12 | No centralized error handling, DIP coupling, N+1/unbounded queries, no tests, no error boundary, local-disk uploads |
| Medium | 18 | Duplicate logic, SOLID/OCP gaps, magic numbers, oversized components, dead schema fields, missing indexes |
| Low | 11 | Naming polish, accessibility labels, minor perf/hygiene items |

---

## 1. Security Issues

| Sev | Finding | Location |
|---|---|---|
| **Critical** | `admin password.txt` — plaintext admin credentials committed to git, not gitignored. | repo root |
| **Critical** | Plaintext input password, stored password hash, and bcrypt match result logged to the console on every login attempt. | `controllers/authController.js:26-27,31` |
| **Critical** | Login page logs the full response — including the raw JWT and complete user object — to the browser console. | `frontend/src/app/login/page.tsx:43,53` |
| High | JWT stored in `localStorage` (not an httpOnly cookie) across all three auth flows — readable by any script if an XSS vector exists anywhere in the app. | `frontend/src/lib/auth.ts`, `login/page.tsx`, `admin/login/page.tsx` |
| High | No rate limiting anywhere, including the unauthenticated public inquiry-creation endpoint — open spam/abuse surface. | `routes/inquiryRoutes.js`, `server.js` (no rate-limit middleware registered at all) |
| High | Dealer `isActive` deactivation is only checked at login time; an already-issued token for a deactivated dealer keeps working for up to 7 days (the JWT expiry) — no per-request re-check, no revocation list. | `middleware/dealerAuthMiddleware.js` |
| Medium | No request-validation library (zod/joi) anywhere — every controller does ad-hoc, inconsistently-applied `if (!x)` checks; several accept unvalidated input (`cartController.addToCart` validates nothing). | across `controllers/*.js` |
| Medium | `inquiryController.js` returns `{error: err.message}` to the client on failure — leaks internal error detail that every other controller's `{message}`-only shape does not. | `controllers/inquiryController.js:26,35` |
| Medium | No `helmet`, no security headers, no CSRF consideration (mitigated somewhat by bearer-token auth, but no explicit policy). | `server.js` |
| Low | CORS origins are a hardcoded array (`localhost:3000`, `arefriz.com`) rather than environment-driven — fine today, but any additional environment (staging) requires a code change. | `server.js:10-12` |

---

## 2. Performance Issues

| Sev | Finding | Location |
|---|---|---|
| High | Three admin/inquiry list endpoints have **no pagination at all** — full collection loaded into memory and over the wire on every page view; will degrade as data grows. Note: the main customer/dealer-facing product and order listing endpoints *do* already paginate correctly — this is the exception, not the rule. | `routes/adminRoutes.js:47-50` (products), `routes/adminRoutes.js:27` (dealers), `controllers/inquiryController.js:32` (`getAllInquiries`) |
| Medium | N+1 query pattern at checkout: one `Product.findById` per cart line item instead of a single `Product.find({_id: {$in: [...]}})` — checkout latency scales linearly with cart size. | `controllers/orderController.js:36-40` |
| Medium | Frontend N+1: `CheckoutView.tsx` and `CartView.tsx` each independently fire one `GET /api/products/:id` per cart item to backfill product details, instead of one batch call — and the two fetch functions are near-duplicate implementations of each other. | `frontend/src/components/checkout/CheckoutView.tsx:116-125`, `frontend/src/components/cart/CartView.tsx:54-77` |
| Medium | The Nodemailer SMTP transport is created fresh inside the request handler on every single call instead of once at module load and reused — needless connection setup cost per dealer-notification email. | `routes/adminOrderRoutes.js` (inline `send-to-dealer` handler) |
| Medium | `next.config.ts` already configures `images.remotePatterns` for product-image optimization, but **no component uses `next/image`** — every product image is a plain `<img>` served at full original size (confirmed across 6 files), losing automatic resizing/lazy-loading/format negotiation that's already paid for in config. | `next.config.ts:4-19`; `ProductCard.tsx:80-84` and 5 other files |
| Low | `getProductById` and `getAllInquiries` skip `.lean()` on read-only queries that only ever get serialized to JSON — minor unnecessary Mongoose document hydration overhead. | `controllers/productController.js:51-56`, `controllers/inquiryController.js:32` |
| Low | Category listing has no explicit `limit`/`page` param from the frontend and would silently truncate at the backend's default (100) with no "load more" UI once a category exceeds that — a latent scalability/correctness gap, not an active bug today. | `frontend/src/app/category/[category]/page.tsx:18-21`, `controllers/productController.js:25` |
| Low | No explicit MongoDB connection-pool sizing (`maxPoolSize`, timeouts) — relies entirely on driver defaults; not wrong, but undecided. | `config/db.js:5-13` |

---

## 3. Duplicate Logic

| Sev | Finding | Location |
|---|---|---|
| **Critical** | An entire second, frozen copy of the whole backend exists (`backend/backend/`) — dead today, but its `Cart` schema is structurally incompatible with the live one; if ever executed against the same database it would corrupt the shared `carts` collection. See `PROJECT_AUDIT.md` §16 for full detail. | `backend/backend/*` |
| High | Two independent "send order to dealer" implementations — different email providers (Resend vs. Nodemailer), different HTML templates, different request shapes (body-only order id vs. route-param id) — reachable from two different live endpoints. | `controllers/orderController.js:158-242` vs. `routes/adminOrderRoutes.js:36-111` |
| Medium | Dealer creation logic (bcrypt-hash-then-create) is implemented twice — once in the dealer controller, once inline in the admin routes file. | `controllers/dealerController.js` (`adminCreateDealer`) vs. `routes/adminRoutes.js` (`POST /dealers`) |
| Medium | Add-to-cart request logic (state machine + fetch call) is copy-pasted between two components instead of one reusing the other. | `frontend/src/components/shared/ProductCard.tsx` vs. `AddToCartButton.tsx` |
| Medium | `VALID_STATUSES` and `DEALER_VALID_STATUSES` are two independently-declared constants holding the identical four-value array. | `controllers/orderController.js:132`, `controllers/dealerOrderController.js:3` |
| Medium | `updateOrderStatus` is mounted at two different URLs (same handler, same guard) — redundant route surface rather than a single canonical endpoint. | `routes/orderRoutes.js` vs. `routes/adminOrderRoutes.js:12` |
| Low | Bcrypt salt-round literal (`10`) repeated across 4 separate call sites instead of one shared constant; JWT expiry (`'7d'`) repeated across 3 call sites. | `authController.js`, `dealerController.js` (×2), `routes/adminRoutes.js` |

---

## 4. Clean Code Issues

| Sev | Finding | Location |
|---|---|---|
| High | Leftover debug logging that prints credentials/tokens to the console in both frontend and backend (cross-referenced under Security as Critical — listed here as the clean-code hygiene failure it also represents: these were clearly left in from active debugging and never cleaned up before shipping). | `authController.js:26-27,31`; `login/page.tsx:43,53`; `cartController.js` (`console.log("USER FROM TOKEN"...)` in every handler); `dealerProductController.js:6-7,46` |
| Medium | Magic numbers/strings scattered with no shared constant: commission `20`, bcrypt cost `10` (×4), JWT expiry `'7d'` (×3), slow-request threshold `500`, upload limit `2MB`, plus bare string literals (`'approved'`, `'pending'`, etc.) used instead of the enum-like constants that already exist elsewhere in the same files. | `orderController.js:73`; `server.js:20`; `upload.js:23`; `routes/adminRoutes.js:64` |
| Medium | Naming: `getCart` is the exported name for an internally-defined `getCartHandler` — a gratuitous rename at the export boundary that makes the function harder to grep for. | `controllers/cartController.js:6,93` |
| Medium | Naming collision: two functions named/intended as "send to dealer" exist with incompatible signatures in two different files — a developer searching for "the" send-to-dealer function will reasonably find only one and assume it's the only one. | `orderController.js:158` vs. `adminOrderRoutes.js:36` |
| Medium | Inconsistent error-handling coverage *within the same file* — some handlers wrapped in try/catch with logging, sibling handlers in the same controller have none, with no apparent rule for which gets which. | `productController.js` (`getProducts` has try/catch; `addProduct`/`getProductById` do not) |
| Low | Deeply nested try/catch (outer handler catch wrapping an inner email-send catch) inside a ~85-line function mixing HTML templating with delivery logic — hard to reason about failure modes at a glance. | `orderController.js:158-242`, `routes/adminOrderRoutes.js:36-111` |

---

## 5. SOLID Violations

| Sev | Finding | Location |
|---|---|---|
| High | **SRP** — `createOrder` is ~100 lines doing seven distinct things (log, validate, fetch products, build line items, compute totals, compute commission split, persist, clear cart) in one function; any pricing or cart-clearing change risks touching unrelated logic in the same place. | `controllers/orderController.js:9-110` |
| High | **DIP** — every controller (`cartController`, `orderController`, `dealerOrderController`, `dealerProductController`) imports and calls concrete Mongoose models directly, and `orderController` additionally instantiates a concrete Resend client at module load — there is no repository/service abstraction anywhere, making unit testing of business logic without a live (or heavily mocked) MongoDB/Resend connection effectively impossible. | `controllers/*.js` (model `require`s throughout) |
| Medium | **SRP** — `sendToDealer` and its route-file twin each mix order lookup, ~70-85 lines of inline HTML templating, email delivery, and order-state mutation in a single function/closure. | `orderController.js:158-242`, `adminOrderRoutes.js:36-111` |
| Medium | **OCP** — commission percentage is a hardcoded literal (`20`) even though the `Order` schema already has its own `commissionPercent` field/default for exactly this purpose — adding per-dealer or per-category commission requires editing this function's body rather than extending configuration. | `orderController.js:73` |
| Medium | **OCP** — sort-option mapping and product-status toggling are both hardcoded `if`-chains / binary toggles that require modifying the function to add a new option, rather than a data-driven lookup table that could be extended. | `routes/adminRoutes.js:42-45,64` |
| Low | **OCP** — role checks (`role !== 'admin'`, `role !== 'dealer'`) are hardcoded per-middleware; adding a new role means touching every middleware file individually. | `authMiddleware.js:28`, `dealerAuthMiddleware.js:15` |
| — | **LSP / ISP** — not meaningfully applicable. The codebase has no class hierarchies or polymorphic interfaces (all "controllers" are plain exported async functions over Mongoose models used directly) — noted for completeness rather than forced as a finding. | n/a |

---

## 6. React Issues

| Sev | Finding | Location |
|---|---|---|
| High | **No error boundary anywhere in the frontend** — no `error.tsx` exists at any route level; a thrown render error in any client component (e.g. `.map` on an unexpectedly `undefined` API field — a real risk given the known cart `items`/`products` mismatch) takes down the entire route with Next.js's default unstyled error overlay. | `frontend/src/app/**` (absence) |
| Medium | Oversized components mixing data fetching, state, business logic, and the full render tree in one file with no extraction into hooks or sub-components: `OrdersPanel.tsx` (725 lines), `AdminDashboard.tsx` (644 lines), `CheckoutView.tsx` (642 lines). | as listed |
| Medium | `window.location.href` used for post-auth navigation instead of the Next.js router — forces a full page reload where client-side routing would suffice; this also happens to be what masks a separate staleness bug (Navbar not reflecting same-tab login/logout without a full reload). | `Navbar.tsx:40`, `login/page.tsx:59` |
| Medium | Product cards use a clickable `<div>` for navigation instead of a link/button — not keyboard-operable and not announced as interactive to assistive tech (the nested "Add to Cart" button itself is fine and correctly stops event propagation). | `frontend/src/components/shared/ProductCard.tsx:72-75` |
| Low | `useEffect(() => { fetchFn() }, [])` pattern (fetch function omitted from deps) repeated across ~6 components — not currently buggy, but violates `exhaustive-deps` and offers no lint protection if the fetch function is later changed to close over changing state. | `CartIcon.tsx:34-38`, `CartView.tsx:79`, `CheckoutView.tsx:133`, `OrdersPanel.tsx:144`, `AdminDashboard.tsx:183`, `FeaturedProducts.tsx:66-68` |
| Low | `Navbar.tsx` reads `localStorage` only once on mount with no `storage` event listener — same-tab login/state changes without a full navigation wouldn't be reflected (currently masked by the full-page reloads noted above). | `frontend/src/components/layout/Navbar.tsx:22-27` |
| Low | Labels not paired with their inputs via `htmlFor`/`id` (purely visual adjacency) — clicking the label text won't focus the input, and the association isn't programmatic for assistive tech. | `CheckoutView.tsx:438-449`, `login/page.tsx:151-172` |

**Areas checked and found clean** (worth noting for a balanced review): list `key` props are stable throughout, no controlled/uncontrolled input mixing, no props-copied-into-state anti-pattern, no significant prop drilling, and Client/Server Component boundaries (`"use client"`) are applied correctly rather than over-broadly.

---

## 7. Express Issues

| Sev | Finding | Location |
|---|---|---|
| High | **No centralized error-handling middleware registered anywhere.** Express 5 auto-forwards rejected promises from `async` handlers to its *default* handler, which returns an HTML error page — several handlers have no try/catch at all (all of `authController.js`, `productController.js`'s `addProduct`/`getProductById`, all of `cartController.js`), so a thrown error on the most security-sensitive (`auth`) and highest-traffic (`cart`) paths returns HTML instead of the app's usual `{message}` JSON shape. | `server.js` (absence), `controllers/authController.js`, `controllers/productController.js`, `controllers/cartController.js` |
| Medium | Business logic embedded directly in route files instead of controllers — `adminRoutes.js` and `adminOrderRoutes.js` both contain ~70-150 lines of inline handler logic (dealer CRUD, product moderation, pay-dealer, send-to-dealer) that every other resource in the app correctly delegates to a controller file. | `routes/adminRoutes.js`, `routes/adminOrderRoutes.js` |
| Low | `/api/admin` is mounted twice from two different route files (`adminRoutes.js` then `adminAuthRoutes.js`) at the same prefix — functionally fine (Express merges them), but signals route organization that could be consolidated into one file per prefix for clarity. | `server.js:34-35` |

---

## 8. MongoDB Issues

*(Full schema-level detail in `docs/DATABASE.md` — summarized here with severity.)*

| Sev | Finding | Location |
|---|---|---|
| High | `Cart.items[].productId` is `ObjectId` + `ref: 'Product'`; `Order.products[].productId` is untyped `String` with no `ref` — same real-world reference typed two incompatible ways, blocking `populate()` on the Order side and inviting comparison bugs. | `models/Cart.js:8` vs. `models/Order.js:18` |
| High | No transition guard on `Order.orderStatus` — any of the four reachable statuses can move to any other, from either an admin or the assigned dealer, via the API. | `controllers/orderController.js:134-156`, `controllers/dealerOrderController.js:31-50` |
| Medium | `orderId` (`ARF#####`) is generated from a random 5-digit number with a `unique` index but **no collision-retry logic** — a duplicate-key error on save is unhandled if it ever occurs. | `models/Order.js:3-13` |
| Medium | Several `Order` schema fields are declared but never written by any code path: `orderStatus: 'placed'`, `paymentStatus: 'released'`, `dealerPayoutStatus`, `statusHistory[]` — dead data modeling that misleads anyone reading the schema. | `models/Order.js` |
| Medium | `inquiries` collection has zero indexes beyond the default `_id`, while its only list endpoint has no pagination either (compounding — see Performance) — will become a full unindexed collection scan as it grows. | `models/Inquiry.js` |
| Low | No schema-level bounds on `Cart.items[].quantity` (or Order cost fields) — negative or absurd quantities are not rejected at the data layer. | `models/Cart.js:12` |

---

## 9. Scalability Issues

| Sev | Finding | Location |
|---|---|---|
| High | Uploaded product images are written to local disk via Multer and served via `express.static` — ties uploads to a single server instance's filesystem; will not survive horizontal scaling (a second instance won't see the first's files) or most PaaS redeploys with ephemeral filesystems. No object-storage (S3-compatible)/CDN integration exists. | `middleware/upload.js`, `server.js:14` |
| High | Unbounded admin/inquiry list queries (see Performance §2) are also a direct scalability ceiling — response size and memory footprint grow without bound alongside the underlying collections. | `routes/adminRoutes.js`, `controllers/inquiryController.js` |
| Medium | No caching layer anywhere (products, cart, or otherwise) — every request hits MongoDB directly. Fine at current traffic, but there's no seam prepared for adding one later (no service layer to insert a cache into without touching controllers directly). | across `controllers/*.js` |
| Medium | JWTs have no revocation mechanism — a compromised or deactivated account's token remains valid for its full 7-day lifetime regardless of any server-side state change (deactivation, password change, etc.). | `authMiddleware.js`, `dealerAuthMiddleware.js` |
| Low | No explicit MongoDB connection-pool configuration ahead of a scale-up (cross-referenced from Performance). | `config/db.js` |

---

## 10. Maintainability Issues

| Sev | Finding | Location |
|---|---|---|
| **Critical** | A frozen, fully-diverged duplicate of the entire backend (`backend/backend/`) sits in the repository unreferenced by anything that runs — a significant source of confusion for any future contributor (human or AI) trying to understand which implementation is real, and a latent data-corruption risk (see Duplicate Logic §3). | `backend/backend/*` |
| **Critical** | The admin login page is functionally broken end-to-end: it calls the customer login endpoint, which explicitly rejects `role === 'admin'` accounts — the real `adminLogin` handler exists but is never called by this UI. | `frontend/src/app/admin/login/page.tsx`, `controllers/authController.js:34` |
| High | **No automated tests exist anywhere in the repository** (`package.json`'s test script is the default placeholder) — this is very plausibly *why* the cart `items`/`products` contract drift (documented in `SYSTEM_DESIGN.md`) shipped and went unnoticed: nothing would have caught a backend response-shape change breaking three frontend consumers. | repo-wide |
| Medium | Two separate API-reference documents have drifted apart (`API_DOCS.md` at repo root vs. `docs/API.md`), risking future documentation trusted at face value being wrong. | `API_DOCS.md`, `docs/API.md` |
| Medium | Inconsistent error-response shapes across controllers (`{message}` is the norm; `inquiryController` also includes `{error: err.message}`) — API consumers can't rely on a single error contract. | `controllers/inquiryController.js:26,35` |
| Low | No lint-enforcement evidence beyond a single explicit `eslint-disable-next-line` (used to permit the plain `<img>` tags noted under Performance) — suggests lint rules exist but aren't uniformly enforced/fixed rather than bypassed deliberately per-case. | `frontend/src/components/shared/ProductCard.tsx` |

---

## Fix-First List (all Critical items, across categories)

1. Remove `admin password.txt` from the repository and rotate the credential.
2. Remove the plaintext password/hash/token console logging in `authController.js` and `login/page.tsx`.
3. Fix or retire the admin login flow (`admin/login/page.tsx` calls the wrong endpoint).
4. Delete (or clearly quarantine and never execute) the `backend/backend/` duplicate fork — it is both a maintainability hazard and a live data-corruption risk if ever run against the same database.

Everything above is a finding only — no code, configuration, or documentation outside this new file was modified while producing this review.
