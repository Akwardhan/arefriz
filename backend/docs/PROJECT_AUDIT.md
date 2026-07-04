# Arefriz — Project Architecture Audit

**Audited by:** Principal Software Architect review (automated, multi-agent code audit)
**Scope:** Full repository at `C:\arefriz\backend` (Express API + Next.js frontend)
**Type:** Read-only audit. No code was modified.

---

## 1. Project Overview

Arefriz is a two-tier e-commerce / dealer-marketplace application:

- **Backend** — Node.js + Express 5 + MongoDB (Mongoose 9) REST API at the repo root. Handles auth (customer, admin, dealer), product catalog, cart, orders, dealer order routing/commission, and email notifications (Resend + Nodemailer).
- **Frontend** — Next.js (App Router) + TypeScript app in `frontend/`, consuming the backend both via server-side API-route proxies (`app/api/*`) and via direct client-side `fetch` calls to the Express API.

The domain: customers browse products, add to cart, check out; orders can be routed to third-party **dealers** who fulfill them for a commission; there's a separate admin panel for managing products, orders, and dealers.

A significant structural anomaly: the repository contains a **second, complete, frozen copy of the entire backend** at `backend/backend/` (see §5, §16). It is not part of the running application.

---

## 2. Complete Folder Tree

```
C:\arefriz\backend/
├─ admin password.txt              ⚠ plaintext credentials, tracked in git
├─ API_DOCS.md                     API reference (root copy)
├─ package.json / package-lock.json
├─ seed.js                         DB seed script (products)
├─ server.js                       Express entrypoint (LIVE)
├─ .gitignore
├─ config/
│  ├─ db.js                        Mongo connection
│  └─ email.js                     Resend "from" address config
├─ controllers/
│  ├─ authController.js            customer + admin login/register
│  ├─ cartController.js            cart CRUD (per-user)
│  ├─ dealerController.js          dealer register/login + admin-create-dealer
│  ├─ dealerOrderController.js     dealer-scoped order list/status
│  ├─ dealerProductController.js   dealer product CRUD
│  ├─ inquiryController.js         contact/inquiry form handling
│  ├─ orderController.js           order create/list/status/email-to-dealer
│  └─ productController.js         product CRUD
├─ middleware/
│  ├─ authMiddleware.js            JWT verify → req.user (protect, adminMiddleware)
│  ├─ dealerAuthMiddleware.js      JWT verify → req.dealer
│  └─ upload.js                    multer image upload config
├─ models/
│  ├─ Cart.js                      per-user cart, items[] + totalAmount
│  ├─ Dealer.js
│  ├─ Inquiry.js
│  ├─ Order.js                     products[] (productId: String — see §14)
│  ├─ Product.js                   indexed catalog model
│  └─ User.js
├─ routes/
│  ├─ adminAuthRoutes.js
│  ├─ adminDealerRoutes.js         ⚠ orphaned, never mounted (§10)
│  ├─ adminOrderRoutes.js          ⚠ contains inline business logic (§15)
│  ├─ adminRoutes.js               ⚠ contains inline business logic (§15)
│  ├─ authRoutes.js
│  ├─ cartRoutes.js
│  ├─ dealerRoutes.js
│  ├─ inquiryRoutes.js
│  ├─ orderRoutes.js
│  └─ productRoutes.js
├─ docs/
│  ├─ API.md                       ⚠ second API reference, drifted from root API_DOCS.md
│  ├─ BRD.md
│  ├─ FRD.md
│  └─ PROJECT_AUDIT.md             (this file)
├─ uploads/                        user-uploaded images — tracked in git, not gitignored
├─ backend/                        ⚠ FULL FROZEN DUPLICATE OF THE ENTIRE APP — dead, unreferenced (§5, §16)
│  └─ (mirrors root: config/, controllers/, middleware/, models/, routes/, server.js, package.json, ...)
└─ frontend/
   └─ src/
      ├─ app/                            Next.js App Router pages + route handlers
      │  ├─ account/, account/orders/    customer account + order history
      │  ├─ admin/, admin/login/, admin/orders/   admin dashboard
      │  ├─ api/auth/login/              BFF proxy → backend /auth/login
      │  ├─ api/inquiries/[, [id]]       BFF proxy → backend /inquiries
      │  ├─ api/orders/my/               BFF proxy → backend /orders/my
      │  ├─ api/products/                BFF proxy → backend /products — ⚠ GET handler broken (§11)
      │  ├─ cart/, checkout/, order-success/
      │  ├─ category/[category]/
      │  ├─ product/[id]/
      │  ├─ login/, register/
      │  └─ layout.tsx, page.tsx, globals.css
      ├─ components/
      │  ├─ admin/        AddProductPanel, AdminDashboard, OrdersPanel
      │  ├─ auth/          AdminGuard, AuthGuard (localStorage token checks)
      │  ├─ cart/          CartView — ⚠ reads wrong response field (§12)
      │  ├─ category/      ProductListing
      │  ├─ checkout/      CheckoutView — ⚠ reads wrong response field (§12)
      │  ├─ home/          Hero, Categories, TrustSection (used) + FeaturedProducts, ProductCatalog (unused, §10)
      │  ├─ layout/        Navbar, Footer, CartIcon (used) + Header (unused, §10)
      │  ├─ shared/        AddToCartButton, ProductCard (duplicate logic, §9), InquiryForm
      │  └─ ui/             badge, button, input (base primitives)
      ├─ data/products.ts  local/sample Product data
      └─ lib/
         ├─ auth.ts                authHeaders()
         ├─ cart.ts                ⚠ dead localStorage cart module, unused (§10, §11)
         ├─ config.ts              BASE_URL constant
         ├─ imageUrl.ts            getImageUrl()
         ├─ useRedirectIfAuth.ts / useRequireAuth.ts   auth-redirect hooks (misplaced, §14)
         └─ utils.ts               cn() classname helper
```

---

## 3. Purpose of Every Folder

| Folder | Purpose |
|---|---|
| `config/` | Environment-driven setup: Mongo connection, outbound email "from" address |
| `controllers/` | Express request handlers — business logic per resource |
| `middleware/` | JWT auth guards for customers/admins (`authMiddleware`) and dealers (`dealerAuthMiddleware`), plus file-upload config |
| `models/` | Mongoose schemas — data layer |
| `routes/` | Express route definitions, wiring URLs to controllers (inconsistently — see §15) |
| `docs/` | Project documentation (business/functional requirements + API reference + this audit) |
| `uploads/` | Storage for product images uploaded via multer |
| `backend/` | **Dead.** A frozen, unreferenced full copy of the app from an early commit. Not required by `server.js`. Candidate for deletion (§16) |
| `frontend/src/app/` | Next.js pages and a thin API-proxy layer to the Express backend |
| `frontend/src/components/` | React UI components, organized by feature area |
| `frontend/src/data/` | Static/sample product data for the frontend |
| `frontend/src/lib/` | Frontend utilities: auth header helpers, config constants, image URL normalization, hooks |

---

## 4. One-Line Purpose of Every Important File

**Backend root (live):**
- `server.js` — Express bootstrap: connects Mongo, sets CORS, mounts all route groups, request-timing logger.
- `seed.js` — wipes and reseeds the `Product` collection with 25 hardcoded items.
- `config/db.js` — Mongo connection; also globally overrides DNS servers to `8.8.8.8`/`8.8.4.4` as a side effect.
- `config/email.js` — exports the "from" address used by Resend-based email sending.
- `controllers/authController.js` — customer register/login + admin login (rejects `role: admin` on the customer path).
- `controllers/cartController.js` — per-user cart add/get/update/remove/clear, backed by `Cart` model.
- `controllers/dealerController.js` — dealer register/login + admin-driven dealer creation.
- `controllers/dealerOrderController.js` — dealer's view of assigned orders + status updates.
- `controllers/dealerProductController.js` — dealer-owned product CRUD.
- `controllers/inquiryController.js` — public contact-form inquiry create/list.
- `controllers/orderController.js` — order creation, listing, status updates, "send to dealer" email.
- `controllers/productController.js` — product CRUD for the public catalog.
- `middleware/authMiddleware.js` — verifies JWT, sets `req.user = {id, role}`; also exports `adminMiddleware` role gate.
- `middleware/dealerAuthMiddleware.js` — parallel JWT guard, sets `req.dealer = {id}`.
- `middleware/upload.js` — multer config, 2MB limit, image types only.
- `models/Cart.js` — per-user cart: `userId`, `items[{productId, name, price, image, quantity}]`, `totalAmount`.
- `models/Dealer.js` — dealer account schema.
- `models/Inquiry.js` — contact-form submission schema.
- `models/Order.js` — order schema; `products[].productId` typed as `String` (inconsistent, §14).
- `models/Product.js` — catalog schema with indexes on status/category/dealer/text-search.
- `models/User.js` — customer/admin account schema.
- `routes/*.js` — one file per resource, mostly thin route→controller wiring (exceptions noted in §15).

**Frontend (key files):**
- `app/layout.tsx` / `app/page.tsx` — root shell and homepage.
- `app/api/products/route.ts` — Next.js API proxy for products; **GET handler is broken code** (§11).
- `components/cart/CartView.tsx` — full cart page; fetches cart, renders line items, handles remove.
- `components/checkout/CheckoutView.tsx` — checkout flow; independently re-fetches/re-shapes cart data.
- `components/shared/ProductCard.tsx` / `AddToCartButton.tsx` — duplicate add-to-cart implementations (§9).
- `components/layout/CartIcon.tsx` — nav cart badge; reads cart count from the (wrong) response field.
- `lib/cart.ts` — unused localStorage cart module (§10).
- `lib/config.ts` — hardcoded backend `BASE_URL`.

---

## 5. Duplicate Files

- **`routes/productRoutes.js`** is byte-identical between root and `backend/backend/routes/productRoutes.js` — the only true copy-paste duplicate found.
- `backend/backend/.claude/settings.local.json` and `package-lock.json` also exist at root, but are not meaningfully "duplicate work" — just artifacts of the frozen copy.
- Every other file under `backend/backend/` has a same-named counterpart at root but has **diverged** (different logic, not identical) — see §16 for the full classification.

---

## 6. Duplicate Models

- No duplicate model files within the live tree.
- `backend/backend/models/Cart.js` is a diverged fork of `models/Cart.js`: live schema is per-user (`userId` + `items[]`), the frozen copy is a single global cart (`products[]` + `totalAmount`, no owner). These are two different data models for the same concept — not interchangeable.
- Cross-model inconsistency (not a duplicate, but related): `Cart.items[].productId` is `ObjectId`; `Order.products[].productId` is `String` — same real-world reference typed two different ways (§14).

## 7. Duplicate Controllers

- `backend/backend/controllers/*.js` — all six controllers are diverged forks of the root versions (dead code, §16).
- Within the live tree: `dealerController.adminCreateDealer` is functionally duplicated by an inline handler in `routes/adminRoutes.js` (`POST /dealers`) — same bcrypt-hash-then-create logic implemented twice in two places.
- `orderController.sendToDealer` (Resend) and the inline handler in `routes/adminOrderRoutes.js` (`POST /:id/send-to-dealer`, Nodemailer) both implement "email this order to its dealer" with separate HTML templates and separate email providers.

## 8. Duplicate Routes

- `updateOrderStatus` (from `orderController.js`) is mounted twice: `PATCH /api/orders/:id/status` (`routes/orderRoutes.js`) and `PATCH /api/admin/orders/:id` (`routes/adminOrderRoutes.js`) — same handler, same guard, two URLs.
- `routes/adminDealerRoutes.js` defines a `POST /` admin-create-dealer route that is never mounted in `server.js` — fully unreachable, and superseded by the inline duplicate in `adminRoutes.js` (§10).
- `backend/backend/routes/*` duplicate the live route surface entirely but are unreferenced (§16).

## 9. Duplicate Components

- `components/shared/ProductCard.tsx` and `components/shared/AddToCartButton.tsx` independently implement the same add-to-cart state machine (`idle/loading/success/error`) and the same raw `fetch` call to `/api/cart/add` — `ProductCard` does not reuse `AddToCartButton`.
- `components/layout/Header.tsx` and `components/layout/Navbar.tsx` are two competing top-nav implementations; only `Navbar` is ever rendered (`Header` is dead, §10).
- Cart total/line-item logic is separately reimplemented in `CartView.tsx` and `CheckoutView.tsx` instead of sharing one cart data hook — compounded by the fact that a shared module (`lib/cart.ts`) already exists for this purpose but sits unused.

## 10. Unused Files

- `routes/adminDealerRoutes.js` — never `require()`d by `server.js` or anything else; fully orphaned.
- `frontend/src/components/layout/Header.tsx` — zero importers; `Navbar` is used instead everywhere.
- `frontend/src/components/home/FeaturedProducts.tsx` — zero importers.
- `frontend/src/components/home/ProductCatalog.tsx` — zero importers.
- `frontend/src/lib/cart.ts` — entire localStorage-based cart module, zero importers; every real cart interaction bypasses it and calls the backend directly.
- The whole `backend/backend/` tree (§16) is unused/unreferenced by the running application.

## 11. Dead Code

- `frontend/src/app/api/products/route.ts` — the `GET` handler is not just unused, it appears to contain a stray literal token (`git`) where handler code should be, and references an undeclared `data` variable. This file will fail to build/compile as written.
- No commented-out code blocks or unreachable post-`return`/`throw` statements were found elsewhere in either the backend or frontend live trees.
- No unused controller exports in the backend — every controller export is wired to at least one route.

## 12. Wrong Imports

- `controllers/productController.js:15` — `addProduct` sets `sellerId: req.user.userId`, but `authMiddleware.js` sets `req.user = { id, role }` (no `userId` key). Every product created this way silently gets `sellerId: undefined`.
- **Critical wire-format mismatch** (not a JS import, but a contract bug with the same effect): the live cart API returns `{ items, totalAmount }`, but three frontend files still read `data.products`:
  - `components/cart/CartView.tsx`
  - `components/checkout/CheckoutView.tsx`
  - `components/layout/CartIcon.tsx`
  Since `data.products` is always `undefined`, all three silently fall back to an empty array. This is a currently-live bug in the shipped frontend — it was clearly written against the `products[]` shape that only exists in the stale `backend/backend` duplicate, and never updated when the live schema became `items[]`.
- No file anywhere imports from the stale `backend/backend/` tree — that duplicate is at least cleanly isolated.

## 13. Circular Dependencies

None found. `require()`/`import` chains across `routes → controllers → models/config` (backend) and `components → lib` (frontend) are strictly one-directional across all files checked.

## 14. Naming Inconsistencies

- `Cart.items[].productId` (`ObjectId`) vs. `Order.products[].productId` (`String`) — same logical reference, different types across models.
- `req.user` (`{id, role}`) vs. `req.dealer` (`{id}`) shapes are consistent, except the `req.user.userId` misuse noted in §12.
- `frontend/src/lib/useRedirectIfAuth.ts` and `useRequireAuth.ts` are hooks living in `lib/` (a plain-utility folder) rather than a `hooks/` folder.
- Two separate API-reference documents have drifted apart: root `API_DOCS.md` vs. `docs/API.md` (473 diff lines).
- Route param naming is otherwise consistent (`:id`) after the recent cart-endpoint fix.

## 15. Architecture Issues

- **Inconsistent layering**: `routes/adminOrderRoutes.js` and `routes/adminRoutes.js` embed ~150 lines of business logic directly in route files (dealer CRUD, product moderation, pay-dealer, send-to-dealer), while every other resource delegates to a `controllers/*.js` file.
- **Two parallel client-access patterns** on the frontend: some features go through Next.js API-route proxies (`app/api/auth/login`, `app/api/inquiries`, `app/api/orders/my`), while most cart/product/admin code calls the Express backend directly via `BASE_URL` — no consistent rule for which pattern to use.
- **Inconsistent error handling**: some controllers wrap every handler in try/catch with logging (`dealerOrderController.js`, most of `orderController.js`); others have none (`cartController.js`, `productController.js`'s `addProduct`/`getProductById`, `authController.js`) — unhandled rejections in these will fall through to Express's default HTML error page instead of a JSON error.
- **Inconsistent error response shape**: most controllers return `{ message }`; `inquiryController.js` also leaks `{ error: err.message }` to the client.
- **No shared cart contract** between frontend and backend (§12) — symptomatic of the two sides evolving independently with no shared types/schema.
- **Duplicated "send order to dealer" flow** across two providers (Resend vs. Nodemailer) and two routes (§7).

## 16. Technical Debt

- **`backend/backend/` — a full, frozen, unreferenced duplicate of the entire application** (config, controllers, middleware, models, routes, server.js, its own package.json/package-lock.json, node_modules-adjacent artifacts). Confirmed via git history: it received exactly one commit ever (`9c8f351`), while every root counterpart has 3-4 subsequent commits. It implements an architecturally older, simpler cart/order model (no auth, no per-user ownership, `products[]` instead of `items[]`). This is the single largest piece of technical debt in the repository — dead weight in every clone/checkout, a source of confusion (as seen in this very conversation, where its schema was initially mistaken for the live one), and a security liability if it contains any stale secrets.
- `admin password.txt` committed to git in plaintext (§17).
- No `.env.example` — onboarding a new engineer requires reverse-engineering required environment variables from source.
- No automated tests anywhere in the repository; `package.json`'s `test` script is the default placeholder.
- `package.json`'s `main` field points to a non-existent `index.js` (dead/wrong field — `start` correctly uses `server.js` instead).
- `uploads/` (user-generated content) is tracked in git instead of being gitignored and served from persistent storage.
- Duplicate/drifted documentation: root `API_DOCS.md` vs. `docs/API.md`.

## 17. Missing Production Practices

- **No centralized Express error-handling middleware** — every controller reimplements its own try/catch → `res.status(500)`, inconsistently (§15).
- **No structured logging** — `console.log`/`console.warn`/`console.error` only, including sensitive leftover debug logs:
  - `controllers/authController.js` — logs the plaintext input password and the stored password hash on every login attempt.
  - `controllers/cartController.js` — logs the full decoded JWT user on every request, in every handler.
  - `controllers/dealerProductController.js` — dumps `req.dealer`, `req.body`, and the full product object before save.
  - `controllers/orderController.js` — dumps payload/user/total/email details across several handlers.
- **No request validation library** (no joi/zod/etc.) — manual, inconsistent `if (!x)` checks per controller; `cartController.addToCart` validates nothing on input.
- **No rate limiting, no `helmet`, no security headers.**
- **No startup validation of required secrets** — `JWT_SECRET`/`MONGO_URI`/email credentials are read from `process.env` with no check that they're actually set; a missing `JWT_SECRET` would fail silently rather than at boot.
- **Plaintext credential file (`admin password.txt`) tracked in git** — critical exposure if the repository is ever made public or shared beyond its current audience.
- **No automated test suite.**
- **DNS override side effect**: `config/db.js` calls `dns.setServers(['8.8.8.8','8.8.4.4'])` globally at boot — affects all DNS resolution process-wide (not just MongoDB), undocumented, and duplicated in `seed.js`.

## 18. Critical Issues

1. **Cart data contract mismatch (live bug):** frontend reads `data.products`; backend returns `data.items`. Cart display/checkout/nav-badge logic across `CartView.tsx`, `CheckoutView.tsx`, and `CartIcon.tsx` is working against a field that doesn't exist in the actual response. (§12)
2. **Plaintext admin credentials committed to git** (`admin password.txt`, not gitignored). (§17)
3. **Broken/uncompilable frontend route file**: `frontend/src/app/api/products/route.ts` `GET` handler contains malformed code and will fail to build. (§11)
4. **Plaintext password/hash logging on every login attempt** (`authController.js`). (§17)
5. **`sellerId` silently saved as `undefined`** on every product creation due to `req.user.userId` vs. `req.user.id` mismatch. (§12)
6. **No centralized error handling** — unhandled errors in several controllers (notably `cartController.js`) return raw HTML instead of JSON, breaking API consumers' error-handling expectations.

## 19. Medium Issues

1. Duplicate "send to dealer" email logic across two providers/routes, risking divergent behavior and double-sends if both paths are ever triggered. (§7)
2. Duplicate `updateOrderStatus` route mounted at two URLs. (§8)
3. Business logic embedded directly in route files (`adminRoutes.js`, `adminOrderRoutes.js`) instead of controllers, breaking the codebase's own layering convention. (§15)
4. Cross-model type inconsistency: `productId` as `ObjectId` in `Cart` vs. `String` in `Order`. (§14)
5. Duplicated add-to-cart logic across `ProductCard.tsx` and `AddToCartButton.tsx` instead of one shared component. (§9)
6. Two parallel API-access patterns on the frontend (proxy routes vs. direct backend calls) with no documented rule for which to use. (§15)
7. Two drifted API documentation files (`API_DOCS.md` vs `docs/API.md`). (§16)
8. `uploads/` tracked in git rather than externalized/gitignored.

## 20. Low Priority Improvements

1. Delete or clearly quarantine the unused frontend files: `Header.tsx`, `FeaturedProducts.tsx`, `ProductCatalog.tsx`, `lib/cart.ts`.
2. Remove the orphaned `routes/adminDealerRoutes.js`.
3. Move `useRedirectIfAuth.ts`/`useRequireAuth.ts` into a `hooks/` folder for naming consistency.
4. Fix `package.json`'s stale `main: "index.js"` field.
5. Add a `.env.example` documenting required environment variables.
6. Remove leftover debug `console.log` statements across controllers.
7. Standardize error response shape (`{ message }`) across all controllers.
8. Document (or eliminate) the global DNS-server override in `config/db.js`.

---

## Project Health Score: **4/10**

**Rationale:** The core feature set works and the live backend/frontend split is reasonable in principle, but the codebase carries a large amount of unmanaged duplication (an entire frozen second backend), at least one currently-live functional bug in a core user flow (cart), a broken frontend source file, committed plaintext credentials, and sensitive debug logging — combined with the complete absence of tests, input validation, centralized error handling, and other baseline production practices. None of these are individually unfixable, but their combination indicates the project has been iterated on quickly without cleanup passes, and is not yet in a state that should be considered production-hardened.
