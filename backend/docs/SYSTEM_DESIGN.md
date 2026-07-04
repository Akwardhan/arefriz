# Arefriz — System Design Document

**Type:** Descriptive architecture document (current state), read-only. No code was modified to produce this document.
**Companion doc:** see `docs/PROJECT_AUDIT.md` for the full file-by-file audit; this document focuses on runtime behavior and flows.

---

## 1. High-Level Architecture

```mermaid
graph TB
    Browser["Browser<br/>(Customer / Admin / Dealer)"]
    NextApp["Next.js App Router<br/>frontend/ — port 3000"]
    ExpressAPI["Express API<br/>server.js — port 5001"]
    Mongo[("MongoDB")]
    Resend["Resend<br/>(email provider A)"]
    Gmail["Gmail SMTP via Nodemailer<br/>(email provider B)"]
    DeadFork["backend/backend/<br/>frozen duplicate app<br/>NOT started by any script"]

    Browser -->|"fetch (BFF pattern)"| NextApp
    NextApp -->|"Next.js API routes proxy:<br/>auth/login, inquiries, orders/my, products"| ExpressAPI
    Browser -->|"direct fetch — most cart/product/admin/order calls<br/>bypass the Next.js proxy layer"| ExpressAPI
    ExpressAPI --> Mongo
    ExpressAPI -->|"orderController.sendToDealer"| Resend
    ExpressAPI -->|"adminOrderRoutes send-to-dealer (inline handler)"| Gmail
    DeadFork -.->|"unreferenced, diverged fork — see PROJECT_AUDIT.md §16"| Mongo

    style DeadFork fill:#3a3a3a,color:#fff,stroke-dasharray: 5 5
```

Two client→backend access patterns coexist with no documented rule for which to use: a handful of features (`auth/login`, `inquiries`, `orders/my`, `products` POST) go through Next.js `app/api/*` route handlers as a BFF proxy; everything else (cart, most order/admin actions) calls the Express API directly from client components using a hardcoded `BASE_URL`.

---

## 2. Frontend Architecture

```mermaid
graph TD
    subgraph "app/ (Next.js App Router — pages)"
        Home["page.tsx"]
        Login["login/, register/"]
        Cart["cart/page.tsx"]
        Checkout["checkout/page.tsx"]
        Product["product/[id]/page.tsx"]
        Category["category/[category]/page.tsx"]
        Account["account/, account/orders/"]
        Admin["admin/, admin/login/, admin/orders/"]
        ApiProxy["api/auth/login, api/inquiries,<br/>api/orders/my, api/products<br/>(Next.js route handlers)"]
    end
    subgraph "components/ (by feature)"
        Shared["shared/<br/>ProductCard, AddToCartButton*, InquiryForm"]
        CartC["cart/CartView"]
        CheckoutC["checkout/CheckoutView"]
        LayoutC["layout/Navbar, Footer, CartIcon, Header (unused)"]
        AdminC["admin/AdminDashboard, AddProductPanel, OrdersPanel"]
        AuthC["auth/AuthGuard, AdminGuard"]
        HomeC["home/Hero, Categories, TrustSection<br/>+ FeaturedProducts, ProductCatalog (unused)"]
    end
    subgraph "lib/ (utilities)"
        AuthLib["auth.ts — authHeaders()"]
        ConfigLib["config.ts — BASE_URL"]
        CartLib["cart.ts — dead localStorage cart module"]
        Hooks["useRequireAuth, useRedirectIfAuth"]
    end

    Cart --> CartC
    Checkout --> CheckoutC
    Product --> Shared
    Admin --> AdminC
    Home --> HomeC
    CartC & CheckoutC & Shared & AdminC --> AuthLib
    CartC & CheckoutC & Shared & AdminC --> ConfigLib
```

Key characteristics (see also §12 State Management):
- No global state container — every page/component fetches its own data independently.
- `ProductCard.tsx` and `AddToCartButton.tsx` (marked `*` above) duplicate the entire add-to-cart request logic instead of one sharing the other.
- Auth/role checks are implemented three separate times (`AuthGuard.tsx`, `AdminGuard.tsx`, an inline check in `admin/layout.tsx`), all independently reading `localStorage`.

---

## 3. Backend Architecture

```mermaid
graph LR
    Routes["routes/*.js<br/>(URL → handler wiring)"]
    Controllers["controllers/*.js<br/>(business logic)"]
    Models["models/*.js<br/>(Mongoose schemas)"]
    Middleware["middleware/<br/>authMiddleware, dealerAuthMiddleware, upload"]
    Mongo[("MongoDB")]

    Routes -->|"most routes"| Controllers
    Routes -.->|"adminRoutes.js, adminOrderRoutes.js:<br/>inline handlers, bypass controller layer"| Mongo
    Controllers --> Models
    Models --> Mongo
    Middleware -.-> Routes
```

The intended layering is Routes → Controllers → Models, and most resources follow it cleanly (`auth`, `cart`, `product`, `inquiry`, `dealer`, `dealerOrder`). Two route files break this pattern by embedding business logic (dealer CRUD, product moderation, pay-dealer, send-to-dealer) directly in the route file, calling `Model.find/save` without going through a controller — an architectural inconsistency, not a hard blocker.

No service/repository layer exists — controllers call Mongoose models directly. No centralized error-handling middleware exists (see §11).

---

## 4. Database Architecture

```mermaid
erDiagram
    USER ||--o| CART : "owns (1:1 via userId, unique index)"
    USER ||--o{ ORDER : places
    DEALER ||--o{ PRODUCT : owns
    DEALER ||--o{ ORDER : "auto-assigned at order creation"
    ORDER {
        string orderId
        ObjectId userId
        array products
        number totalAmount
        string paymentStatus
        ObjectId dealerId
        number commissionPercent
        string orderStatus
    }
    CART {
        ObjectId userId
        array items
        number totalAmount
    }
    PRODUCT {
        ObjectId _id
        string name
        number price
        ObjectId dealerId
        string status
    }
    USER {
        ObjectId _id
        string email
        string password
        string role
    }
    DEALER {
        ObjectId _id
        string email
        string password
        boolean isActive
    }
    INQUIRY {
        ObjectId _id
        string email
        string status
    }
```

Notable inconsistency: `Cart.items[].productId` is typed `ObjectId` (`models/Cart.js`), while `Order.products[].productId` is typed `String` (`models/Order.js`) — the same real-world reference (a product id) is represented with two different types depending on which document it lives in. Neither model uses Mongoose `populate` for these embedded references in the live code paths that matter (cart/order responses embed a denormalized snapshot of name/price/image at write time instead).

`Order` schema also declares several fields that no code path ever sets, making them dead data: `orderStatus: 'placed'` (enum value, never assigned — orders are created directly into `'processing'`), `dealerPayoutStatus` (never mutated, only `dealerPaid` boolean is used), `paymentStatus: 'released'` (enum value, never assigned), and `statusHistory[]` (declared, never pushed to).

`Product.js` is the best-indexed model (compound indexes on `status+createdAt`, `status+category`, `dealerId+createdAt`, plus a text index on `name`).

---

## 5. Authentication Flow

Three independent JWT-based auth flows exist (customer, admin, dealer), each with its own middleware guard but sharing the same `JWT_SECRET`. All three store the token client-side in `localStorage` (keys `token`, `user`) and send it back as `Authorization: Bearer <token>` — no httpOnly cookies.

### 5a. Customer Login

```mermaid
sequenceDiagram
    participant B as Browser
    participant FE as login/page.tsx
    participant API as Express /api/auth/login
    participant DB as MongoDB (User)

    B->>FE: submit email + password
    FE->>API: POST /api/auth/login
    API->>DB: User.findOne({email})
    DB-->>API: user document
    API->>API: bcrypt.compare(password, user.password)
    alt user.role === "admin"
        API-->>FE: 403 Invalid credentials
    else valid customer
        API->>API: jwt.sign({userId, role}, JWT_SECRET, 7d)
        API-->>FE: 200 {token, user}
        FE->>B: localStorage.setItem(token, user)
        FE->>B: redirect "/"
    end
```

### 5b. Admin Login — currently broken end-to-end

```mermaid
sequenceDiagram
    participant B as Browser
    participant FE as admin/login/page.tsx
    participant CustomerAPI as POST /api/auth/login
    participant AdminAPI as POST /api/admin/login (unused)

    B->>FE: submit admin email + password
    FE->>CustomerAPI: POST /api/auth/login (same endpoint customers use)
    CustomerAPI->>CustomerAPI: loginUser() explicitly rejects role === "admin"
    CustomerAPI-->>FE: 403 Invalid credentials — always, for real admins
    Note over FE,AdminAPI: adminLogin() exists at POST /api/admin/login<br/>and would succeed, but the admin login page<br/>never calls it. Admin login cannot currently succeed via this UI.
```

### 5c. Dealer Login

```mermaid
sequenceDiagram
    participant B as Browser
    participant API as Express /api/dealer/login
    participant DB as MongoDB (Dealer)

    B->>API: POST /api/dealer/login {email, password}
    API->>DB: Dealer.findOne({email})
    API->>API: bcrypt.compare(password, dealer.password)
    alt dealer.isActive === false
        API-->>B: 403 Account is inactive
    else active dealer
        API->>API: jwt.sign({dealerId, role:"dealer"}, JWT_SECRET, 7d)
        API-->>B: 200 {token, dealer}
    end
```

Per-request guards: `middleware/authMiddleware.js`'s `protect` sets `req.user = {id, role}` from the JWT; `adminMiddleware` additionally requires `req.user.role === 'admin'`; `middleware/dealerAuthMiddleware.js` requires `decoded.role === 'dealer'` and sets `req.dealer = {id}`. Route-level protection on the frontend (`AuthGuard`, `AdminGuard`, `admin/layout.tsx`) is a client-only `localStorage` presence/role check with no server round-trip to confirm token validity.

---

## 6. Cart Flow

```mermaid
sequenceDiagram
    participant U as User
    participant PC as ProductCard / AddToCartButton
    participant API as Express POST /api/cart/add
    participant DB as MongoDB (Cart)
    participant Icon as CartIcon (nav badge)

    U->>PC: click "Add to Cart"
    PC->>API: POST /api/cart/add {productId, name, price, quantity}
    API->>DB: find-or-create Cart by userId
    API->>DB: match existing item by productId.toString(), increment qty, else push
    API->>DB: recalc totalAmount, save
    API-->>PC: 200 {items, totalAmount}
    PC->>PC: window.dispatchEvent("cart-updated") — no detail payload
    PC-->>Icon: event received, no count in detail → triggers a fresh GET /api/cart
    Icon->>API: GET /api/cart
    API-->>Icon: {items, totalAmount}
    Icon->>Icon: reads response.products (bug — field is "items") → count effectively empty
```

`CartView.tsx` and `CheckoutView.tsx` do **not** listen for the `cart-updated` event — they only fetch once on mount, so an already-open cart/checkout tab won't reflect an item added elsewhere without a manual reload. Both also read `data.products` from the same `{items, totalAmount}` response shape, so their displayed cart contents are built from `undefined` (see PROJECT_AUDIT.md §12/§18 for the full contract-mismatch writeup).

---

## 7. Checkout Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CV as CheckoutView
    participant CartAPI as GET /api/cart
    participant OrderAPI as POST /api/orders
    participant DB as MongoDB
    participant ClearAPI as DELETE /api/cart/clear

    U->>CV: open /checkout
    CV->>CartAPI: GET /api/cart (on mount)
    CartAPI-->>CV: {items, totalAmount}
    CV->>CV: reads data.products (bug) — item list effectively empty from this response;<br/>falls back to per-item GET /api/products/:id lookups
    U->>CV: fill shipping form + select items/shipping/installation
    CV->>CV: compute subtotal, logisticsCost, taxes (18%), installationCost, techSurcharge (client-side)
    U->>CV: submit order
    CV->>OrderAPI: POST /api/orders {products[], shippingDetails, subtotal, logisticsCost, taxes, ...}
    OrderAPI->>DB: re-fetch each Product by id (authoritative name/price/image/dealerId)
    OrderAPI->>OrderAPI: recompute totalAmount server-side from submitted cost components
    OrderAPI->>DB: save Order (orderStatus: "processing")
    OrderAPI->>DB: Cart.findOneAndUpdate — items: []  (totalAmount left stale)
    OrderAPI-->>CV: {orderId}
    CV->>CV: navigate to /order-success (after 2.5s)
    CV->>ClearAPI: DELETE /api/cart/clear (redundant second clear of the same cart)
```

The order-creation endpoint trusts the **client-submitted** line items and cost breakdown (which items, quantities, shipping method, tax) — it only re-verifies each product's authoritative price/name/dealer server-side, and recomputes a total from the client-supplied cost components rather than independently deriving shipping/tax/installation from server-side rules. There is no cross-check against the actual DB cart contents or its stored `totalAmount`.

---

## 8. Order Flow

### 8a. Order status lifecycle

```mermaid
stateDiagram-v2
    [*] --> processing : createOrder (checkout)
    processing --> shipped
    processing --> delivered
    processing --> cancelled
    shipped --> delivered
    shipped --> processing
    shipped --> cancelled
    delivered --> processing
    delivered --> shipped
    delivered --> cancelled
    cancelled --> processing
    cancelled --> shipped
    cancelled --> delivered
```

Both an admin (`PATCH /api/orders/:id/status` or the duplicate `PATCH /api/admin/orders/:id`, same underlying `updateOrderStatus` handler) and the assigned dealer (`PATCH /api/dealer/orders/:id/status`, scoped to their own orders) can move an order to any of `processing | shipped | delivered | cancelled` — **there is no transition guard**, so e.g. `delivered → processing` is technically possible via the API. `orderStatus: 'placed'` is declared in the schema enum but no code path ever sets it — orders are created directly into `'processing'`. Dealer assignment happens automatically inside `createOrder`, derived from the first ordered product that has a `dealerId` — it is not a separate admin action.

### 8b. Payment / dealer payout

```mermaid
stateDiagram-v2
    [*] --> pending : createOrder (paymentStatus default)
    pending --> paid : admin PATCH /pay-dealer\n(guard: orderStatus === "delivered")
    paid --> paid : repeatable, no idempotency guard
```

The `pay-dealer` endpoint sets **both** `dealerPaid: true` and `paymentStatus: 'paid'` in the same write — conflating "the dealer's commission was paid out" with "the buyer's payment was received," and unconditionally overwriting `paymentStatus` regardless of its prior value. The schema's `paymentStatus: 'released'` enum value and the separate `dealerPayoutStatus` field are never set by any code path.

---

## 9. Dealer Email Flow

Two independent, competing implementations exist and are both live/reachable:

### 9a. Flow A — `orderController.sendToDealer` (Resend)

```mermaid
sequenceDiagram
    participant Admin
    participant API as POST /api/orders/send-to-dealer
    participant DB as MongoDB (Order)
    participant Resend

    Admin->>API: {orderId, dealerEmail} (order id in BODY)
    API->>DB: Order.findById(orderId)
    API->>Resend: send HTML email (itemized order, buyer details)
    alt email send fails
        Resend-->>API: error
        API->>API: caught, logged — but still proceeds
    end
    API->>DB: save order.dealerEmail (emailSent/emailSentAt NOT set)
    API-->>Admin: 200 "Email sent successfully" — even if the send actually failed
```

### 9b. Flow B — `adminOrderRoutes.js` inline handler (Nodemailer / Gmail)

```mermaid
sequenceDiagram
    participant Admin
    participant API as POST /api/admin/orders/:id/send-to-dealer
    participant DB as MongoDB (Order)
    participant Gmail as Nodemailer (Gmail SMTP)

    Admin->>API: {dealerEmail} body, order id in ROUTE PARAM
    API->>DB: Order.findById(req.params.id)
    API->>Gmail: sendMail (different HTML template than Flow A)
    alt sendMail throws
        Gmail-->>API: error
        API-->>Admin: 500 — order NOT updated
    else success
        API->>DB: save dealerEmail, emailSent = true, emailSentAt = now()
        API-->>Admin: 200
    end
```

The two flows use different request shapes (body vs. route param for order id), different providers/credentials (`RESEND_API_KEY` vs `EMAIL_USER`/`EMAIL_PASS`), different HTML templates, and only Flow B maintains the `emailSent`/`emailSentAt` fields — making those fields an unreliable signal of "was this order actually emailed" if Flow A was used. The live `OrdersPanel.tsx` admin UI calls Flow A.

---

## 10. Admin Flow

```mermaid
flowchart TD
    Login["admin/login/page.tsx"] -->|"POST /api/auth/login\n(NOT /api/admin/login)"| LoginAPI["loginUser()\nrejects role==admin → 403"]
    LoginAPI -.->|"admin login cannot currently succeed via this page"| Dashboard
    Dashboard["admin/page.tsx → AdminDashboard"] -->|"GET/PATCH /api/inquiries"| Inquiries[(Inquiry)]
    Dashboard -->|"POST /api/products"| AddProduct["AddProductPanel"]
    AddProduct -->|"POST /api/products"| ProductsDB[(Product)]
    OrdersPage["admin/orders/page.tsx → OrdersPanel"] -->|"GET /api/orders"| OrdersDB[(Order)]
    OrdersPage -->|"PATCH /api/orders/:id/status"| OrdersDB
    OrdersPage -->|"POST /api/orders/send-to-dealer (Flow A)"| Resend

    subgraph "Server-side admin routes — reachable but not called by any current admin UI"
        AdminRoutes["adminRoutes.js: dealer CRUD, product moderation (inline handlers)"]
        AdminOrderRoutes["adminOrderRoutes.js: pay-dealer, send-to-dealer Flow B (inline handlers)"]
        AdminDealerRoutes["adminDealerRoutes.js: POST / — orphaned, never mounted in server.js"]
    end
```

Two independent client-side admin guards exist (`admin/layout.tsx`'s inline check and `components/auth/AdminGuard.tsx`), both doing a `localStorage`-only role check with no server verification. The dealer-management and product-moderation admin endpoints exist server-side but no current admin UI component calls them — either dead server code, or a missing admin UI surface, depending on intent.

---

## 11. API Request Lifecycle

```mermaid
flowchart TD
    Req[Incoming HTTP request] --> CORS["cors()\norigins: localhost:3000, arefriz.com"]
    CORS --> JSON["express.json()"]
    JSON --> Static["/uploads static file serving"]
    Static --> Timing["inline timing/logger middleware\n(warns if >500ms)"]
    Timing --> Mounts{"Route mount order in server.js"}
    Mounts --> R1["/api/auth"]
    Mounts --> R2["/api/products"]
    Mounts --> R3["/api/orders"]
    Mounts --> R4["/api/cart"]
    Mounts --> R5["/api/admin/orders"]
    Mounts --> R6["/api/admin (adminRoutes)"]
    Mounts --> R7["/api/admin (adminAuthRoutes — 2nd mount, same prefix)"]
    Mounts --> R8["/api/inquiries"]
    Mounts --> R9["/api/dealer"]
    R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 --> Handler["Controller / inline handler executes"]
    Handler -->|success| JSONResp["res.json({...})"]
    Handler -->|throws / rejected promise| Express5["Express 5 auto-catches async errors"]
    Express5 --> DefaultHandler["Express's BUILT-IN default error handler\n(no custom app.use((err,req,res,next)) registered)"]
    DefaultHandler --> HTMLError["Returns an HTML error page, status 500 —\nbreaks the API's usual {message} JSON contract"]
```

`package.json` confirms Express `^5.2.1`, which auto-forwards rejected promises from `async` handlers to the error pipeline (unlike Express 4). Because no custom error-handling middleware is registered, any uncaught error in a try/catch-less handler (several exist in `cartController.js`, `productController.js`, `authController.js`) surfaces as Express's default HTML error page instead of the application's normal JSON error shape — inconsistent, but it does not crash the process.

---

## 12. State Management

```mermaid
graph LR
    subgraph "No global store — every component independently fetches"
        CartIcon["CartIcon.tsx\nown useState + useEffect"]
        CartView["CartView.tsx\nown useState + useEffect"]
        CheckoutView["CheckoutView.tsx\nown useState + useEffect"]
        OrdersPanel["OrdersPanel.tsx\nown useState + useEffect"]
        AdminDashboard["AdminDashboard.tsx\nown useState + useEffect"]
    end
    API[("Express API")]
    LS[("localStorage: token, user")]

    CartIcon -->|"GET /api/cart on mount +\non 'cart-updated' DOM event"| API
    CartView -->|"GET /api/cart on mount only"| API
    CheckoutView -->|"GET /api/cart on mount only"| API
    OrdersPanel -->|"GET /api/orders on mount"| API
    AdminDashboard -->|"GET /api/inquiries on mount"| API
    CartIcon & CartView & CheckoutView & OrdersPanel & AdminDashboard -->|"authHeaders() reads token"| LS
```

An exhaustive search for `createContext`, `useContext`, Redux, or Zustand across `frontend/src` returned zero matches — there is no global/shared state layer anywhere in the frontend. Auth/session state is read independently from `localStorage` by every component that needs it (no single source of truth). Cart state specifically has no shared cache between `CartIcon` and `CartView`/`CheckoutView`: cross-component sync relies entirely on an untyped `window.dispatchEvent(new Event("cart-updated"))` DOM event with no payload, which — combined with the `items`/`products` field-name bug (§6) — means the nav badge, cart page, and checkout page can each show different cart contents at the same time.

---

## 13. Current Architecture Weaknesses

(Full file-level detail in `docs/PROJECT_AUDIT.md`; this list frames the same findings at the system-design level.)

- **No shared API contract** between frontend and backend — the cart response shape drifted (`items` vs. `products`) with nothing to catch it (no shared types, no schema validation, no contract tests).
- **No single source of truth for frontend state** — every component fetches independently; cart state can visibly diverge across the nav badge, cart page, and checkout page.
- **Checkout trusts client-submitted order data** — line items, quantities, and cost breakdown come from the client payload with only per-item price/name re-verified server-side; the DB cart's own `totalAmount` is never cross-checked.
- **Unguarded order state machine** — any of the four statuses can transition to any other, by either an admin or the assigned dealer, with no transition table; several schema fields (`placed`, `released`, `dealerPayoutStatus`, `statusHistory`) are dead, never written.
- **Two competing implementations** of the same business capability (dealer email notification) using different providers, templates, and request shapes — a maintenance and correctness risk (e.g. a fix applied to one path silently doesn't apply to the other).
- **Admin login is broken end-to-end** in the current wiring — the admin login page calls the customer login endpoint, which explicitly rejects admin accounts.
- **No centralized error handling** — inconsistent error shapes and, for handlers without try/catch, HTML error pages returned from a JSON API.
- **A frozen, fully diverged duplicate of the entire backend** (`backend/backend/`) exists in the repo, unreferenced by anything that runs, but a source of confusion for anyone (human or AI) reading the codebase.
- **Three separate, independently-implemented auth/role guards** on the frontend, all client-only `localStorage` checks with no server-side token validation at the routing layer.
- Plaintext admin credential file (`admin password.txt`) committed to the repository.
- No automated tests, no request validation library, no rate limiting, no structured logging — see PROJECT_AUDIT.md §17 for the full list.

---

## 14. Recommended Production Architecture

```mermaid
graph TB
    Browser --> NextApp["Next.js — ALL backend calls go through\napp/api/* proxies (single consistent pattern)"]
    NextApp --> ErrorMW["Centralized error-handling middleware\n(consistent JSON error envelope)"]
    ErrorMW --> ExpressAPI["Express API"]
    ExpressAPI --> Validation["Request validation layer (e.g. zod)\nat every controller boundary"]
    Validation --> Services["Service layer\ncartService · orderService · dealerService"]
    Services --> Mongo[("MongoDB")]
    Services --> EmailService["Single EmailService abstraction\n(one provider, one template set)"]
    EmailService --> Provider["Resend (or chosen provider)"]

    subgraph "Frontend data layer"
        Query["React Query / SWR cache"]
        Store["Lightweight global store (Context or Zustand)\nfor cart summary/count"]
    end
    NextApp -.-> Query
    Query -.-> Store
```

Concrete recommendations, grouped by area:

**Contract & data flow**
- Define shared types (or an OpenAPI/zod schema) for `Cart`, `Order`, and `Product` shapes, generated or hand-synced into both `frontend` and `backend` — would have caught the `items`/`products` drift at build time instead of at runtime.
- Make the server the sole source of truth for checkout pricing: recompute shipping/tax/installation from server-side rules and the authoritative DB cart, rather than trusting client-submitted cost fields.

**State management**
- Introduce a data-fetching cache (React Query or SWR) so cart/order data is fetched once and shared, not independently re-fetched per component.
- Add a small global store (Context is sufficient at this scale) for cart summary/count so `CartIcon` updates reactively on mutation instead of via an untyped DOM event.
- Consolidate the three auth/admin guards into one shared guard component/hook.

**Backend robustness**
- Add a single centralized Express error-handling middleware returning a consistent `{message}` JSON shape for every failure path.
- Add a request-validation layer (zod/joi) at controller boundaries instead of ad-hoc `if (!x)` checks.
- Add an explicit order-status transition table/guard; retire the dead enum values or start using them consistently.
- Collapse the two dealer-email implementations into one `emailService.sendDealerNotification(order)` call, used by a single endpoint.
- Replace `console.*` with a structured logger; remove logging of credentials/tokens entirely.

**Security & ops**
- Delete `admin password.txt` from the repo and rotate that credential; add it (and `uploads/`) to `.gitignore` appropriately.
- Add `.env.example` documenting required environment variables; validate required secrets at process startup.
- Add `helmet` and basic rate limiting.
- Consider moving JWTs to httpOnly cookies to reduce XSS exposure, or explicitly document the accepted trade-off if `localStorage` is kept.

**Housekeeping**
- Remove the `backend/backend/` frozen duplicate entirely — it carries no active value and is a source of confusion.
- Add an automated test suite (unit tests for controllers/services at minimum; integration tests for the auth/cart/checkout flows given how much drift has already occurred there undetected).

This section is a design recommendation only — no changes have been made to the codebase as part of this document.
