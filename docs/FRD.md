# Functional Requirement Document (FRD)
## ARefriz — B2B Refrigeration Spare Parts Marketplace

**Version:** 1.0 | **Date:** 2026-04-11 | **Status:** Draft | **Ref:** BRD v1.0

---

## 1. User Roles

| Role     | Description                                                                 |
|----------|-----------------------------------------------------------------------------|
| **Buyer**    | Technician, dealer, or industrial buyer. Browses, searches, and purchases parts. |
| **Seller**   | Verified supplier. Lists products, manages inventory, fulfills orders.       |
| **Admin**    | ARefriz staff. Approves accounts, manages platform, resolves disputes.       |

---

## 2. Authentication

### 2.1 Registration

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| AU-01 | Buyers and Sellers register via email + password                            |
| AU-02 | Registration form captures: name, company, role (buyer/seller), phone, address |
| AU-03 | Seller registration additionally requires: business license or trade document upload |
| AU-04 | On submission, account is set to **Pending** — Admin must approve before access |
| AU-05 | User receives email confirmation on submission and again on approval/rejection |

### 2.2 Login & Session

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| AU-06 | Login via email + password                                                  |
| AU-07 | Password reset via email OTP link                                           |
| AU-08 | Sessions expire after 24 hours of inactivity                                |
| AU-09 | Role-based redirect after login: Buyer → catalog, Seller → dashboard, Admin → admin panel |

---

## 3. Product Management

### 3.1 Seller — Listing Products

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| PM-01 | Seller can create a product listing with: part number, name, brand, compatible models, category, price, stock quantity, lead time, images, description |
| PM-02 | Part number must be unique per seller                                        |
| PM-03 | Seller can edit or deactivate any of their listings at any time              |
| PM-04 | New listings are immediately visible to buyers (no per-listing admin approval) |
| PM-05 | Seller dashboard shows all listings with status, stock, and sales count      |

### 3.2 Buyer — Browsing & Search

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| PM-06 | Search by: part number (exact), brand, compatible model, or category        |
| PM-07 | Results display: part name, seller, price, stock status, lead time          |
| PM-08 | Filters: brand, category, price range, in-stock only                        |
| PM-09 | Product detail page shows full specs, seller profile, and available quantity |
| PM-10 | Out-of-stock items are visible but cannot be added to cart                  |

---

## 4. Orders & Checkout

### 4.1 Cart & Checkout

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| OC-01 | Buyer can add items from multiple sellers into a single cart                |
| OC-02 | Cart displays: item, seller, unit price, quantity, line total, cart total   |
| OC-03 | Checkout captures: delivery address, contact, and payment                   |
| OC-04 | Platform commission is calculated and applied automatically at checkout (not shown to buyer) |
| OC-05 | Payment is processed via integrated payment gateway (PCI-compliant)         |
| OC-06 | Order is split per seller on the backend; buyer sees a single order summary |

### 4.2 Order Management

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| OC-07 | Buyer can view all orders with status: Placed → Confirmed → Shipped → Delivered |
| OC-08 | Seller receives notification on new order and must confirm or reject within 24 hours |
| OC-09 | Seller updates shipment status and can add tracking number                  |
| OC-10 | Buyer receives email notifications on status changes                        |
| OC-11 | Buyer can cancel an order before it is confirmed by seller                  |
| OC-12 | Completed order triggers commission settlement record in Admin panel         |

---

## 5. Admin Approval System

### 5.1 Account Approval

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| AA-01 | Admin panel lists all Pending accounts with submitted documents             |
| AA-02 | Admin can Approve or Reject any pending account with a mandatory reason note |
| AA-03 | Rejected users receive email with reason and option to resubmit             |
| AA-04 | Admin can suspend or deactivate any active Buyer or Seller account          |

### 5.2 Platform Management

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| AA-05 | Admin can view all orders, with ability to filter by status, seller, or date |
| AA-06 | Admin can view commission ledger: per-order fee, total collected, payout due to seller |
| AA-07 | Admin can manually flag or remove any product listing                       |
| AA-08 | Admin dashboard shows: total users, active listings, orders this month, GMV |

---

## 6. User Flows

### 6.1 Buyer Registration & First Purchase

```
Register → Submit docs (if dealer/industrial) → Pending
→ Admin approves → Email confirmation
→ Login → Search part by number or model
→ View product detail → Add to cart
→ Checkout → Enter address → Pay
→ Order placed → Seller confirms → Ships → Delivered
```

### 6.2 Seller Onboarding & First Sale

```
Register (with business document) → Pending
→ Admin approves → Email confirmation
→ Login → Go to dashboard → Add product listing
→ Listing live → Buyer places order
→ Seller receives notification → Confirms order
→ Ships item → Updates tracking → Order complete
→ Commission deducted → Net payout recorded
```

### 6.3 Admin Approval Flow

```
New registration submitted → Appears in Admin panel (Pending queue)
→ Admin reviews details and documents
→ Approve: account activated, user emailed
   OR
→ Reject: reason recorded, user emailed with option to resubmit
```

---

## 7. Permissions Matrix

| Feature                    | Buyer | Seller | Admin |
|----------------------------|:-----:|:------:|:-----:|
| Browse & search catalog    |  ✓    |  ✓     |  ✓    |
| Place orders               |  ✓    |        |       |
| Manage own listings        |       |  ✓     |       |
| View own orders            |  ✓    |  ✓     |  ✓    |
| Approve/reject accounts    |       |        |  ✓    |
| Remove listings            |       |        |  ✓    |
| View commission ledger     |       |        |  ✓    |
| Suspend users              |       |        |  ✓    |

---

## 8. Out of Scope (v1)

- Buyer-to-seller messaging / chat
- Quote request workflow
- Reviews and ratings
- Multi-currency support
- Logistics / shipping integration
