# Business Requirement Document (BRD)
## ARefriz — B2B Refrigeration Spare Parts Marketplace

**Version:** 1.0 | **Date:** 2026-04-11 | **Status:** Draft

---

## 1. Overview

ARefriz is a B2B digital marketplace that connects buyers of refrigeration spare parts — technicians, dealers, and industrial buyers — with verified suppliers. The platform enables fast, accurate part discovery and streamlined procurement, generating revenue through a commission on completed orders.

---

## 2. Problem Statement

Sourcing refrigeration spare parts is slow and fragmented. Buyers waste time contacting multiple suppliers, struggle to identify exact part numbers, and lack pricing transparency. Suppliers lack a centralized channel to reach qualified buyers at scale.

---

## 3. Target Users

| User Type         | Goal                                              |
|-------------------|---------------------------------------------------|
| Technicians       | Find exact replacement parts quickly for repairs  |
| Dealers           | Bulk-source inventory at competitive prices       |
| Industrial Buyers | Procure parts for facilities and OEM maintenance  |
| Suppliers         | List inventory and reach verified B2B buyers      |

---

## 4. Core Requirements

### 4.1 Functional

- **Part Search & Discovery** — Search by part number, brand, model, or category with exact-match filtering
- **Supplier Listings** — Verified supplier profiles with inventory, pricing, and lead times
- **Order Management** — Cart, quote requests, order placement, and status tracking
- **Buyer Accounts** — Saved addresses, order history, repeat-order shortcuts
- **Supplier Dashboard** — Inventory management, order fulfillment, and sales analytics
- **Commission Engine** — Automatic deduction of platform fee per completed transaction

### 4.2 Non-Functional

- Search results returned in < 2 seconds
- Mobile-responsive interface
- Role-based access (buyer vs. supplier vs. admin)
- Secure payment processing (PCI-compliant)

---

## 5. Business Model

| Revenue Stream     | Detail                                      |
|--------------------|---------------------------------------------|
| Order Commission   | % fee charged on each completed transaction |
| Premium Listings   | Sponsored placement for suppliers (future)  |

Commission rate and fee structure to be defined by business team prior to launch.

---

## 6. Success Metrics

- Time-to-find-part < 3 minutes for 80% of searches
- Order completion rate > 70%
- Supplier onboarding: 50+ verified suppliers at launch
- Monthly GMV growth rate (tracked post-launch)

---

## 7. Out of Scope (v1)

- Consumer (B2C) sales
- Direct shipping / logistics fulfillment
- Multi-currency / international markets
- Mobile native app

---

## 8. Assumptions & Constraints

- Suppliers are responsible for maintaining their own inventory accuracy
- Platform operates as a marketplace (no stock held by ARefriz)
- Initial launch targets a single geographic market
