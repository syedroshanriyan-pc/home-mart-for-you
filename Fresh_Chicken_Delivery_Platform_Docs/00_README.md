# Fresh Chicken — Online Ordering & Delivery Platform
## Master Project Documentation Package

**Project:** Fresh Chicken  
**Business:** Fresh chicken retail / meat shop  
**Service area:** Mulbagal city  
**Initial scale:** ~30–150 orders/day  
**Expected growth:** up to ~300 orders/day initially without architectural redesign  
**Primary surfaces:** Customer website, Admin panel, Delivery Partner portal  
**Document status:** V1 planning baseline  
**Date:** 2026-10-03

---

## 1. Purpose

Fresh Chicken is a local-commerce platform for a fresh chicken retail shop. The platform provides:

1. A premium, SEO/AEO-optimized public website.
2. Customer registration, location-based delivery, product browsing, customization, cart, checkout, payment and order tracking.
3. An administrative operating system for products, daily pricing, inventory availability, orders, delivery partners, coupons, offers, customers, reviews, notifications and analytics.
4. A restricted delivery-partner portal for assigned deliveries.
5. Transactional customer notifications and admin-triggered promotional notifications.
6. A future-ready payment gateway integration boundary.

This package is the implementation baseline for development in Antigravity or another coding agent.

---

## 2. Documentation Index

| File | Purpose |
|---|---|
| `01_PRD.md` | Product Requirements Document |
| `02_BRD.md` | Business Requirements Document |
| `03_SRS.md` | Software Requirements Specification |
| `04_SYSTEM_ARCHITECTURE.md` | System architecture and component design |
| `05_WORKFLOWS.md` | End-to-end workflows and state machines |
| `06_TRD.md` | Technical Requirements / Technical Design |
| `07_DATABASE_DESIGN.md` | Database entities, relationships and data policy |
| `08_API_SPECIFICATION.md` | REST API contracts |
| `09_CUSTOMER_SPEC.md` | Customer website requirements |
| `10_ADMIN_SPEC.md` | Detailed admin-panel requirements |
| `11_DELIVERY_PARTNER_SPEC.md` | Delivery-partner portal requirements |
| `12_UI_UX_DESIGN_SYSTEM.md` | UX, visual system and responsive design |
| `13_SEO_AEO.md` | SEO/AEO requirements |
| `14_SECURITY_PRIVACY.md` | Security, privacy and authorization |
| `15_TESTING_QA.md` | Test strategy and acceptance criteria |
| `16_DEPLOYMENT_OPERATIONS.md` | Deployment, monitoring and operations |
| `17_OPEN_DECISIONS.md` | Requirements requiring final business decisions |
| `18_MASTER_ANTIGRAVITY_PROMPT.md` | Master implementation prompt |
| `19_ACCEPTANCE_CHECKLIST.md` | Final production acceptance checklist |

---

## 3. Confirmed Business Rules

### Delivery
- Service is for Mulbagal city.
- First 3 km from the configured shop location are free.
- Distance beyond 3 km is charged at ₹1.50 per 100 metres.
- Delivery calculation must be performed server-side.
- Customer location is obtained through location permission, map pin and/or address confirmation.
- The minimum order requires at least 1 kg of qualifying meat/chicken.
- COD has an additional ₹7 fee.
- Target delivery time is approximately 20 minutes.

### Products
- Fresh chicken.
- 500g and 1kg/flexible weight-based quantities.
- Leg pieces.
- Wings.
- Breast.
- Boneless.
- Whole chicken.
- Chicken 65 and other masala products.
- Combos.
- Packaged beverages such as Pepsi/Coke.
- Farm eggs.
- Desi eggs.
- Products can be sold by weight, piece or fixed unit.
- Chicken prices can change daily.
- Product-level availability is manually toggled ON/OFF by admin.

### Chicken customization
- Curry cut.
- Small pieces.
- Large pieces.
- Boneless.
- Whole.
- Cleaned.
- Skin removed.
- Fat removed.
- Customization must be configurable per product rather than globally applied to every SKU.

### Order states
- Order Placed.
- Confirmed.
- Preparing.
- Out for Delivery.
- Delivered.
- Cancellation must be supported where permitted by business rules.

### V1 status simulation
- During initial development/demo mode, order states may advance automatically at approximately 5-minute intervals.
- Delivered is terminal.
- The implementation must isolate simulation logic from the real admin-controlled workflow so simulation can be disabled without redesigning the system.

### Customer features
- Registration/login.
- Name, mobile number and delivery information.
- Current location / live location assisted address capture.
- Multiple saved addresses.
- Reorder.
- Favorites.
- Product/order ratings and reviews.
- Order history.
- Invoice download.
- Coupons/offers.
- Loyalty and referral are future features.

### Offers
- ₹100 OFF.
- 10% OFF.
- BUY 2 GET 1.
- FREE DELIVERY.
- ₹50 OFF ABOVE ₹499.
- Owner creates coupon codes from the admin panel.

### Notifications
Transactional:
- Order confirmation.
- Payment confirmation.
- Order accepted.
- Preparing.
- Out for delivery.
- Delivered.
- Cancellation.

Marketing:
- Offers and promotions.
- Admin can type a message and send it to eligible/active notification subscribers in one action.

### Delivery partners
- Added and managed by admin.
- Separate restricted login/portal.
- Can see assigned order details and customer delivery location.
- Can navigate to customer.
- Can mark delivery as delivered.
- Delivered action triggers customer notification and rating prompt.
- Agent should only access data required for assigned deliveries.

### Branding
- Brand name: Fresh Chicken.
- No existing logo.
- Premium minimal-luxury visual direction.
- Logo to be designed as part of brand/UI work.
- Avoid generic cartoon chicken / loud fast-food styling.

---

## 4. Non-goals for V1

- Loyalty points.
- Referral program.
- Full automatic inventory quantity deduction.
- Complex multi-warehouse management.
- Marketplace/multi-vendor support.
- Microservices architecture.
- Native mobile applications unless separately commissioned.

---

## 5. Critical Privacy Constraint

The customer requested that unnecessary customer history and behavioral data not be stored in the database.

The implementation should follow data minimization:
- Store only data required for authentication, active/current orders, delivery, payments, legal/accounting requirements and notification delivery.
- Convenience data such as recent searches and UI preferences can remain local.
- Favorites and order history cannot be reliably cross-device if stored only on one device. The architecture should document this tradeoff and use minimal server-side records where the feature requires account synchronization.
- Never store unnecessary behavioral telemetry.

---

## 6. Implementation Principle

Do not begin with visual pages and invent backend behavior later.

Build in this order:

1. Requirements and acceptance criteria.
2. Domain model and state machines.
3. Database schema.
4. Authentication/RBAC.
5. API contracts.
6. Admin order workflow.
7. Customer ordering flow.
8. Delivery partner workflow.
9. Notifications.
10. Payments.
11. SEO/AEO.
12. UI polish.
13. Testing.
14. Deployment.

---

## 7. Important Open Decisions

See `17_OPEN_DECISIONS.md`. Any item marked OPEN must be confirmed before it becomes a hard business rule.
