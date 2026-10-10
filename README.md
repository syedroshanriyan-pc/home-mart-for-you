# 🍗 Fresh Chicken — Online Ordering & Delivery Platform

Production-ready hyperlocal fresh chicken delivery platform built with **Next.js 15 (App Router)**, **React 19**, **Prisma ORM**, and **Tailwind CSS**.

Designed to run **100% locally on localhost** with zero Docker containers or external cloud databases required.

---

## 🚀 Fast Localhost Start (Under 1 Minute)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v24)
- **npm**: v9+

### 2. Setup & Database
No database setup is required! The project uses an embedded SQLite database (`prisma/dev.db`) pre-seeded with all categories, products, customization options, and test accounts.

```bash
# Install dependencies (if not already installed)
npm install

# (Optional) Re-generate Prisma Client or reset database if needed:
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 👥 Seed Demo Accounts

Use these credentials to test all roles immediately:

| Role | Mobile / Email | Password | Primary Surface |
| :--- | :--- | :--- | :--- |
| **Admin** | `9845000001` / `admin@freshchicken.com` | `AdminPassword123!` | `/admin` (Operations Portal) |
| **Delivery Rider** | `9845000002` / `delivery@freshchicken.com` | `Delivery123!` | `/delivery` (Rider Portal) |
| **Customer** | `9845000003` / `customer@freshchicken.com` | `Customer123!` | `/` (Customer Storefront) |

---

## 📱 Three Platform Portals

### 1. Customer Storefront (`/`)
- **Homepage (`/`)**: Hero banners, freshness commitment, categories carousel, bestseller chicken cuts, customer reviews, hyperlocal hub details.
- **Menu & Catalog (`/menu`, `/menu/[category]`, `/product/[slug]`)**: Category filter, search, cutting/cleaning customization options (Curry cut medium/small, Biryani cut, Skinless, Bone-in), variant weight selection (500g, 1000g).
- **Cart & Checkout (`/cart`, `/checkout`)**:
  - Server-validated **1kg minimum qualifying meat threshold**.
  - Dynamic delivery fee calculation (Free within 3km, ₹1.50 per 100m beyond).
  - Cash on Delivery (COD) with +₹7 surcharge or Online Payment.
  - Coupon redemption engine (`WELCOME50`, `FREEDEL`, `FESTIVAL100`).
- **Account & Tracking (`/account`, `/account/orders`, `/account/orders/[id]`)**:
  - Live timeline order tracker (Placed ➔ Confirmed ➔ Preparing ➔ Out for Delivery ➔ Delivered).
  - Re-order button, invoice download, and order rating & review modal.

### 2. Admin Operations Portal (`/admin`)
- **Dashboard (`/admin`)**: Today's GMV, order volume, Average Order Value (AOV), active order funnel, SLA alerts.
- **Live Orders (`/admin/orders`, `/admin/orders/[id]`)**: Order status management, delivery agent assignment.
- **Daily Pricing Board (`/admin/pricing`)**: Instant wholesale mandi price updates per cut with quick +/- adjustments and audit trail.
- **Inventory Stock (`/admin/inventory`)**: Live stock availability toggles and emergency shortage notices.
- **Products Catalog (`/admin/products`, `/admin/products/[id]`)**: Add and edit products, variants, cutting options.
- **Categories (`/admin/categories`)**: Create and arrange catalog categories.
- **Coupons & Offers (`/admin/coupons`)**: Create promo codes, max discount caps, expiry dates, and toggle active status.
- **Delivery Fleet (`/admin/delivery`)**: View rider duty availability (Online/Offline), active deliveries, register new riders.
- **Customer Directory (`/admin/customers`)**: Customer accounts, phone numbers, order history.
- **Review Moderation (`/admin/reviews`)**: Publish or hide customer reviews.
- **Broadcast Notifications (`/admin/notifications`)**: Live offer push broadcasts with recipient count tracking.
- **Operational Analytics (`/admin/analytics`)**: SLA compliance monitoring and delivery velocity.
- **Shop Settings (`/admin/settings`)**: Hub GPS coordinates, delivery radius, per-100m fees, COD fee rules.
- **Audit Logs (`/admin/audit`)**: Immutable log of price updates and operational actions.

### 3. Delivery Executive Portal (`/delivery`)
- **Rider Dashboard (`/delivery`)**: On-duty / Off-duty toggle switch, active assigned runs, completed deliveries, cash to remit.
- **Run Sheet (`/delivery/orders/[id]`)**:
  - Customer contact with direct phone call button (`tel:`).
  - Customer address with one-click **Turn-by-Turn GPS Navigation in Google Maps**.
  - Cash collection callout (exact COD cash amount to collect vs Prepaid).
  - Action buttons: "Start Delivery Run (Leave Hub)" ➔ "Confirm Handover & Deliver".

---

## 🧪 Automated Business Rule Tests

Run the domain validation tests (delivery distance/rate, 1kg min meat threshold, COD surcharge, coupon evaluations):

```bash
npm test
```
All 13 unit and integration tests run in under 400ms without needing any external server.

# homemart4u
