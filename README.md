# 🛒 homemart4u — Hyperlocal Fresh Groceries & Halal Meats Platform

A modern, production-grade hyperlocal e-commerce platform built for **homemart4u** (Mulbagal, Karnataka) using **Next.js 15 (App Router)**, **React 19**, **Prisma ORM**, and **Tailwind CSS**.

Designed to run **100% locally on localhost** with zero external cloud dependencies or Docker containers required.

---

## 🏪 Store Information & Operations

| Detail | Store Information |
| :--- | :--- |
| **Brand Name** | **homemart4u** |
| **Tagline** | Daily Essentials at Wholesale Prices & 100% Farm-Fresh Halal Meats |
| **Store & Hub Location** | **Srinivaspur Road, Mulbagal, Karnataka – 563131** |
| **Operational Hours** | **8:30 AM – 7:00 PM** (Monday – Sunday / All 7 Days) |
| **Direct Contact Phone** | |
| **Customer Support Email** |  |
| **Delivery Radius** | Express hyperlocal delivery within Mulbagal & surrounding areas |

---

## 🚀 Fast Localhost Quickstart

### 1. Prerequisites
- **Node.js**: v18.0.0+ (Tested on Node v20 & v24)
- **npm**: v9.0.0+

### 2. Install & Database Setup
The platform connects to PostgreSQL via Prisma ORM configured in `.env`.

```bash
# Install dependencies
npm install

# Generate Prisma Client & push schema to database
npx prisma generate
npx prisma db push

# Seed administrative account and product catalog
npm run prisma:seed
```

### 3. Run Development Server
```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 🔐 Administrative Access & Security

The administrative operations console is accessible

| Parameter | Configuration Source | Access Level |
| :--- | :--- | :--- |
| **Admin Login** | Configured via `.env` (`ADMIN_EMAIL` / `ADMIN_MOBILE` + `ADMIN_PASSWORD`) | Full catalog, orders, fleet, discounts & store controls |
| **Customer Experience** | OTP / Passwordless Mobile & Email Registration | Browsing, cart, orders, live tracking & personal account |

---  

## 🛍️ Dual Department Catalog & Tag System

`homemart4u` offers a dual-department shopping experience accessible with a single click:

### 1. 🥦 Groceries Department
- **Tagline**: *"Daily Essentials at Wholesale Prices"*
- **Product Range**: Cooking oils, rice, flour, pulses, spices, packaged foods, daily breakfast items, beverages, and household staples.
- **Badge**: Wholesale Savings tag (`Daily Essentials at Wholesale Prices`), Save ₹ discount badges, and Food Type tags (`VEG` / `EGG`).

### 2. 🍗 Fresh Meat Department
- **Tagline**: *"100% Farm-Fresh & Halal Certified"*
- **Product Range**: Whole chicken, curry cut (medium/small), biryani cut, skinless breast fillet, lollipop, liver, gizzard, mutton, and fresh seafood.
- **Badge**: `100% Halal Certified` emblem, FSSAI quality assurance, Food Type (`NON_VEG`), and Custom Cutting Options.

### 🏷️ Admin Product Management & Tag Engine
The admin panel (`/admin/products`) enables effortless product creation in 3 simple steps:
1. **Department Selection**: Choose **Meat Section** or **Groceries Section**.
2. **Category & Subcategory**: Select from existing categories (or create new on-the-fly) and optional subcategory.
3. **Details, Pricing & Tags**:
   - Product Name & Description.
   - MRP & Discounted Selling Price.
   - **Save Price Tag**: Automatically computes discount percentage or allows custom text (e.g. `Save ₹30`).
   - **Halal Tag**: Toggle `100% Halal Certified` (default active for Meats).
   - **Food Type Tag**: Choose `VEG` (green dot), `NON_VEG` (red dot), or `EGG` (yellow dot).
   - **Stock Availability**: Instant 1-click in-stock / out-of-stock toggle.

---

## ⚡ Automated Backend Payment Verification (Zero Manual UTR)

Unlike manual portals that require users to type in 12-digit UTR numbers, `homemart4u` features an **automated backend verification pipeline**:

1. **Dynamic NPCI UPI QR Generation**:
   - When a customer checks out via Online UPI, a dynamic QR code is generated with the exact order total and unique transaction reference.
   - Works seamlessly with Google Pay, PhonePe, Paytm, BHIM, Cred, and all UPI apps.
2. **Zero Manual UTR Entry**:
   - The customer simply scans the QR code or taps their preferred UPI intent link.
   - The browser polls `/api/payments/[id]/status` while the backend automatically reconciles the transaction clearance.
   - Upon confirmation, the order status updates to `CONFIRMED` in real time with audio-haptic feedback.
3. **Session Expiry & Safety**:
   - Dynamic payment sessions expire after 5 minutes (300 seconds) if unfulfilled.
   - Complete audit trail logged in the database (`AuditLog` table).
4. **Cash on Delivery (COD)**:
   - Configurable COD surcharge (+₹7) with driver cash collection tracking.

---

## 🔒 Security Architecture & Audit Report

The entire platform has been comprehensively audited and hardened against standard OWASP vulnerabilities:

### 1. Role-Based Access Control (RBAC)
- Enforced at both the **Edge Middleware layer** (`src/middleware.ts`) and within **API Route handlers**.
- `/admin/*` and `/api/admin/*` strictly require `ADMIN` or `SUPER_ADMIN` privileges.
- `/delivery/*` and `/api/delivery/*` require `DELIVERY_AGENT` or `ADMIN` privileges.
- `/account/*` requires active user session; order data and invoices are strictly isolated so customers can only access their own orders.

### 2. HTTP Security Headers
All responses include hardened defense-in-depth security headers:
- `X-Frame-Options: DENY` (Clickjacking prevention)
- `X-Content-Type-Options: nosniff` (MIME-sniffing prevention)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- Cross-Origin Resource Sharing (CORS) restricted to origin and localhost.

### 3. Rate Limiting & Abuse Prevention
- In-memory sliding window rate limiter (`src/lib/rate-limiter.ts`).
- Maximum 5 requests per minute for `/api/auth/login` and `/api/auth/register` with `HTTP 429 Too Many Requests` and `Retry-After` headers.
- Rate limiting on `/api/orders` to prevent automated checkout spam.

### 4. Input Sanitization & XSS Defense
- Strict input sanitization via `src/lib/security.ts`:
  - Strips dangerous HTML tags (`<script>`, `<iframe>`, `javascript:`, `onerror=`).
  - Mobile number normalization (enforces 10-digit Indian numbers `^[6-9]\d{9}$`).
  - Email format validation with regex.
  - Address sanitization with field-length caps.

### 5. Password Security & Secret Protection
- Password hashing using `bcryptjs` with 10 salt rounds.
- Passwords are never returned in user queries (`passwordHash` excluded from client payloads).
- `.env` files are checked and sanitized: no live database credentials or secrets are committed to git.
- `.env.example` provides safe, documented placeholders.

### 6. Mobile & UI Bug Fixes
- Removed all dark solid rectangular placeholders on mobile headers.
- Fixed dual department switcher with high-contrast, polished pill navigation (`bg-white` border with emerald and rose active states).
- Verified zero horizontal overflow (`overflow-x-hidden`) across all viewports.
- Clickable telephone links (`tel:`) and email links (`mailto:`).
- Custom 404 page (`src/app/not-found.tsx`).
- Transparent vector SVG branding (`logo.svg`, `logo-icon.svg`, `favicon.svg`, `src/app/icon.svg`).

---

## 📁 Project Structure

```
fresh-chicken/
├── prisma/
│   ├── schema.prisma         # Data models (User, Product, Category, Order, Payment, AuditLog)
│   ├── dev.db                # Embedded SQLite database
│   └── seed.js               # Seed script with demo accounts and catalog items
├── public/
│   ├── logo.svg              # Full vector SVG logo (emblem + homemart4u typography)
│   ├── logo-icon.svg         # Transparent vector brand mark (rooster, home, cart)
│   └── favicon.svg           # High-resolution vector favicon
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with metadata, fonts, and header/footer
│   │   ├── page.tsx          # Homepage with department switcher & hero banner
│   │   ├── menu/             # Catalog browsing, filtering, and search
│   │   ├── product/[slug]/   # Product detail page with cuts & weight selection
│   │   ├── cart/             # Shopping cart with threshold validation
│   │   ├── checkout/         # Multi-step checkout with address & payment selection
│   │   ├── account/          # Customer profile & live order tracking
│   │   ├── contact/          # Store location, phone, email & contact form
│   │   ├── admin/            # Admin operations portal (Orders, Products, Fleet, Pricing)
│   │   ├── delivery/         # Delivery executive portal (Run sheet, GPS, Cash)
│   │   ├── not-found.tsx     # Custom branded 404 error page
│   │   └── api/              # Secure API route handlers with RBAC & rate limiting
│   ├── components/
│   │   ├── layout/           # Navbar, Footer, Mobile Navigation
│   │   ├── catalog/          # ProductCard, CategoryBar, GroceryCatalogView
│   │   ├── home/             # StorefrontView (dual Groceries/Meat switcher)
│   │   ├── payment/          # DynamicPaymentModal with real-time UPI QR verification
│   │   └── ui/               # Reusable UI primitives (Button, Modal, Badges, Logo)
│   ├── context/              # React Context (AuthContext, CartContext)
│   ├── lib/                  # Business logic (auth, delivery, rate-limiter, security, upi)
│   └── middleware.ts         # Edge route protection, RBAC, and security headers
├── tests/                    # Automated business domain & security unit tests
├── package.json              # Scripts configured with npx for Windows compatibility
└── README.md                 # Complete platform documentation
```

---

## 🧪 Automated Testing

Run the automated test suite covering delivery distance formulas, order validation, COD surcharges, coupon logic, rate limiting, and XSS sanitization:

```bash
npm test
```

Expected result:
```text
✔ Delivery Fee Calculation Rules (4 tests)
✔ Order Meat Quantity Validation Rules (5 tests)
✔ COD Surcharge Rules (1 test)
✔ Coupons Calculation Rules (3 tests)
✔ Security & Sanitization Rules (4 tests)
✔ Rate Limiter Rules (1 test)

ℹ tests 20 | suites 4 | pass 20 | fail 0
```

To run TypeScript verification:
```bash
npx tsc --noEmit
```

---

## 📞 Support & Store Inquiries

For orders, franchise queries, or customer support:
- **Visit Us**: Srinivaspur Road, Mulbagal 563131, Karnataka
- **Call**: 
- **Email**: 
- **Hours**: 8:30 AM – 7:00 PM (Monday – Sunday)

---

© 2026 **homemart4u**. All Rights Reserved. Powered by [R2D Labs](https://r2dlabs.r2d-labs.workers.dev).
