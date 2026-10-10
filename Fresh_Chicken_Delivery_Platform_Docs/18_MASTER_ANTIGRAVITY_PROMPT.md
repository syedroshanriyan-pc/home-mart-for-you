# MASTER ANTIGRAVITY IMPLEMENTATION PROMPT
## Fresh Chicken — Production-Ready Online Ordering & Delivery Platform

You are the lead product engineer, solution architect, UI/UX engineer, backend engineer, database engineer, security engineer and QA engineer responsible for implementing the Fresh Chicken platform described in this prompt.

Do not treat this as a simple restaurant landing page. It is a local-commerce ordering and delivery platform with three role-specific surfaces:

1. Customer website.
2. Admin operations panel.
3. Delivery-partner portal.

The implementation must be production-oriented, modular, secure and responsive.

---

# 1. SOURCE OF TRUTH

Treat these project documents as the requirements baseline:

- `01_PRD.md`
- `02_BRD.md`
- `03_SRS.md`
- `04_SYSTEM_ARCHITECTURE.md`
- `05_WORKFLOWS.md`
- `06_TRD.md`
- `07_DATABASE_DESIGN.md`
- `08_API_SPECIFICATION.md`
- `09_CUSTOMER_SPEC.md`
- `10_ADMIN_SPEC.md`
- `11_DELIVERY_PARTNER_SPEC.md`
- `12_UI_UX_DESIGN_SYSTEM.md`
- `13_SEO_AEO.md`
- `14_SECURITY_PRIVACY.md`
- `15_TESTING_QA.md`
- `16_DEPLOYMENT_OPERATIONS.md`
- `17_OPEN_DECISIONS.md`

Do not silently override requirements.

If an OPEN decision blocks implementation, implement a clean configuration boundary and document the assumption.

---

# 2. BRAND

Brand name:

**Fresh Chicken**

Visual direction:

**Minimal luxury**

Do not create:
- Cartoonish chicken branding.
- Generic red/yellow fast-food design.
- Excessive gradients.
- Template-looking UI.
- Cluttered dashboards.

Create:
- Premium typography.
- Elegant restrained colors.
- High-quality product imagery.
- Clean whitespace.
- Strong information hierarchy.
- Subtle motion.
- Excellent mobile experience.

Create a premium logo as part of the design system.

---

# 3. CUSTOMER WEBSITE

Build:

```text
/
 /menu
 /menu/[category]
 /product/[slug]
 /offers
 /cart
 /checkout
 /login
 /register
 /account
 /account/addresses
 /account/orders
 /account/orders/[id]
 /account/favorites
 /account/reviews
 /about
 /contact
 /location
```

Homepage sections:

1. Hero.
2. Today's Specials.
3. Offers.
4. Popular Products.
5. Why Choose Fresh Chicken.
6. How It Works.
7. Customer Reviews.
8. Location/Map.
9. Contact.
10. Footer.

---

# 4. CUSTOMER AUTHENTICATION

Registration must support:
- Name.
- Mobile number.
- Delivery address/location.

Location UX:

```text
Use Current Location
        ↓
Get coordinates
        ↓
Reverse geocode
        ↓
Show detected address
        ↓
Customer confirms/edits
        ↓
Save address
```

Also support map selection.

Do not force users to manually type a long address if GPS/map data can populate it.

---

# 5. PRODUCTS

Initial catalog:

```text
Fresh Chicken
- Chicken 500g
- Chicken 1kg
- Leg Pieces
- Wings
- Breast
- Boneless
- Whole Chicken
- Chicken 65
- Other Masala Products
- Combos

Beverages
- Pepsi
- Coke
- Other packed drinks

Eggs
- Farm Eggs
- Desi Eggs
```

Do not hard-code this catalog into frontend-only code.

Admin must manage products.

Support:
- Weight-based products.
- Piece-based products.
- Fixed-unit products.

---

# 6. DAILY PRICING

Prices change daily.

Admin must be able to:
- View current price.
- Change price.
- Preserve price history.
- Activate/deactivate variants.

Historical orders must retain historical item price snapshots.

Never recalculate old orders using today's price.

---

# 7. PRODUCT AVAILABILITY

V1 inventory is manual availability.

Admin can toggle:

```text
IN STOCK
OUT OF STOCK
```

Customer must see:
- In stock → Add to cart.
- Out of stock → disabled purchase + clear label.

Server must validate availability at checkout/order creation.

Do not rely on frontend state.

---

# 8. CHICKEN CUSTOMIZATION

Support product-specific customization:

Cutting:
- Curry cut.
- Small pieces.
- Large pieces.
- Boneless.
- Whole.

Cleaning:
- Cleaned.
- Skin removed.
- Fat removed.

Do not show irrelevant customization options for drinks/eggs.

Customization must be stored in order-item snapshots.

---

# 9. CART

Cart must show:
- Product.
- Variant.
- Quantity.
- Weight.
- Customization.
- Price.
- Line total.

Cart must calculate:
- Subtotal.
- Qualifying meat weight.
- Coupon discount.
- Delivery fee.
- COD fee.
- Final total.

But the browser calculation is only a preview.

The server recalculates all financial values.

---

# 10. MINIMUM ORDER

Minimum qualifying meat requirement:

**1 kg.**

Examples:
- 500g chicken + Pepsi = invalid.
- 500g chicken + 500g chicken = valid.
- 1kg chicken + Pepsi = valid.
- 1kg chicken + eggs = valid.

Do not use cart rupee total as the minimum-order test.

---

# 11. DELIVERY

Initial service market:

**Mulbagal city.**

Delivery rule:

- First 3km = FREE.
- Every 100m beyond 3km = ₹1.50.

Formula:

```text
chargeableMeters = max(0, distanceMeters - 3000)
deliveryFee = chargeableMeters / 100 * 150 paise
```

Use integer money and integer distance internally.

The final rounding rule is currently OPEN; do not hard-code a business assumption without documenting it.

Delivery distance must be calculated server-side.

Prefer road-routing distance for real operations if the selected map provider supports it.

---

# 12. COD

COD adds:

**₹7**

Online payment does not add the COD fee.

Payment gateway must be abstracted so it can be integrated later.

Never trust frontend payment-success flags.

---

# 13. ORDER STATES

Customer-facing:

```text
ORDER PLACED
↓
CONFIRMED
↓
PREPARING
↓
OUT FOR DELIVERY
↓
DELIVERED
```

Delivered is terminal.

Record timestamps.

---

# 14. V1 ORDER SIMULATION

For demo/development mode:

```text
Placed
↓ 5 min
Confirmed
↓ 5 min
Preparing
↓ 5 min
Out for Delivery
↓ 5 min
Delivered
```

Implement as a server-aware feature flag.

Do NOT implement as a fragile frontend-only timer.

Configuration:

```text
ORDER_SIMULATION_ENABLED=true
```

Production:

```text
ORDER_SIMULATION_ENABLED=false
```

When disabled, admin and delivery-partner workflows control real state transitions.

---

# 15. TARGET DELIVERY

Target approximately 20 minutes.

Do not make an unconditional “guaranteed within 20 minutes” promise unless the owner explicitly approves that business wording.

Store timestamps so actual delivery performance can be measured.

---

# 16. COUPONS

Admin-created coupons must support:

- Fixed discount: ₹100 OFF.
- Percentage: 10% OFF.
- Buy 2 Get 1.
- Free delivery.
- ₹50 OFF ABOVE ₹499.

Coupon fields:
- Code.
- Type.
- Value.
- Minimum order.
- Maximum discount where applicable.
- Start.
- Expiry.
- Usage limit.
- Per-user limit.
- Active/inactive.
- Product/category scope where applicable.

Validate coupon twice:
1. Preview.
2. Final order creation.

---

# 17. CUSTOMER FEATURES

Implement:
- Saved addresses.
- Multiple addresses.
- Current location.
- Map pin.
- Reorder.
- Favorites.
- Ratings.
- Reviews.
- Order history.
- Invoice download.

Future only:
- Loyalty.
- Referral.

Reorder must use current price and current availability.

---

# 18. CUSTOMER DATA MINIMIZATION

Do not build unnecessary behavioral tracking.

Server retains only what is necessary for:
- Account.
- Active/current orders.
- Delivery.
- Payment/order records.
- Notification delivery.
- Business/legal requirements.

Convenience data may remain device-local where appropriate.

If order history is requested to be device-only, explicitly document that it will not synchronize across devices. Do not pretend device-only history can behave like server-synchronized history.

---

# 19. NOTIFICATIONS

Transactional:
- Order confirmation.
- Payment confirmation.
- Order accepted.
- Preparing.
- Out for delivery.
- Delivered.
- Cancellation.

Marketing:
- Offers.
- Promotions.

After delivery partner marks delivered:
1. Order becomes Delivered.
2. Store delivery timestamp.
3. Notify customer.
4. Show rating/review CTA.

---

# 20. ADMIN BROADCAST

Admin must have:

`Notifications → Send Offer`

UI:
- Title.
- Message.
- Optional destination URL.
- Audience.
- Recipient estimate.
- Send button.

One click sends to eligible active notification subscribers.

Do not synchronously loop through hundreds of users inside one HTTP request if a queue/batch mechanism is available.

Track:
- Recipient count.
- Success count.
- Failure count.
- Invalid subscriptions.

Marketing notifications require appropriate opt-in/opt-out handling for the selected channel.

---

# 21. ADMIN PANEL

Build modules:

```text
Dashboard
Orders
Delivery
Products
Categories
Inventory
Pricing
Coupons & Offers
Customers
Reviews
Notifications
Analytics
Staff
Settings
Audit Log
```

Dashboard:
- Sales.
- Orders.
- Pending.
- Preparing.
- Out for delivery.
- Delivered.
- Cancelled.
- AOV.
- New orders.
- Unassigned deliveries.
- Orders approaching target delivery time.
- Out-of-stock products.

Orders:
- Search.
- Filters.
- Order detail.
- Status transitions.
- Customer details required for operations.
- Payment.
- Coupon.
- Delivery.
- Audit history.

Products:
- CRUD.
- Images.
- Categories.
- Variants.
- Pricing.
- Availability.
- Customization.
- SEO fields.

Inventory:
- Manual ON/OFF.

Pricing:
- Daily price changes + history.

Coupons:
- Full coupon lifecycle.

Customers:
- Minimal operational information.

Reviews:
- Pending/published/hidden.

Notifications:
- Broadcast.

Analytics:
- Sales/orders/delivery/coupons/ratings.

Staff:
- RBAC.

Settings:
- Shop details.
- Location.
- Delivery rules.
- COD fee.
- Minimum order.
- Target delivery time.
- Business hours.
- Notifications.
- Payments.
- SEO.
- Feature flags.

---

# 22. DELIVERY PARTNER

Admin can add delivery partners.

Fields:
- Name.
- Mobile.
- Login/authentication setup.
- Active/inactive.

Delivery partner has a separate restricted portal.

Dashboard:
- Assigned orders.
- Active delivery.
- Completed today.
- Availability.

Delivery detail:
- Customer name.
- Delivery address.
- Customer coordinates.
- Order items.
- Quantity.
- Customizations.
- Order total.
- Delivery instructions.

Do not expose unrelated customer information.

Actions:
```text
ASSIGNED
↓
START DELIVERY
↓
OUT FOR DELIVERY
↓
MARK DELIVERED
```

When marked delivered:
- Update order.
- Save agent.
- Save timestamp.
- Audit.
- Notify customer.
- Trigger rating prompt.

---

# 23. DELIVERY AGENT LOCATION

For V1, customer destination navigation is required.

Continuous live agent tracking is optional/future.

Do not store continuous location history without an explicit requirement.

---

# 24. REVIEWS

Only verified completed orders can create reviews.

Rating:
1–5.

Review:
Optional text.

Admin moderation:
- Pending.
- Published.
- Hidden.

Never fabricate reviews or ratings.

---

# 25. SEO/AEO

Implement:
- LocalBusiness structured data.
- Product structured data where appropriate.
- Offer data.
- Breadcrumbs.
- Sitemap.
- robots.txt.
- Canonicals.
- Open Graph.
- Semantic HTML.
- Local service-area content.
- FAQs with real visible answers.
- Fast pages.
- Optimized images.

AEO questions should include:
- Delivery area.
- Minimum order.
- Delivery fee.
- Chicken customization.
- Delivery target.
- Payment methods.
- COD fee.

Do not keyword-stuff.

---

# 26. SECURITY

Mandatory:
- Server-side authorization.
- RBAC.
- Input validation.
- Rate limiting.
- Secure authentication.
- Password hashing.
- Session security.
- CSRF protection where applicable.
- XSS prevention.
- SQL injection prevention.
- IDOR/BOLA protection.
- File-upload validation.
- Payment webhook verification.
- Audit logs.

Never trust:
- Client price.
- Client delivery fee.
- Client coupon discount.
- Client role.
- Client order status.
- Client payment-success state.

---

# 27. DATA MODEL

Implement PostgreSQL entities for:
- Users.
- Addresses.
- Categories.
- Products.
- Product variants.
- Customization groups/options.
- Orders.
- Order items.
- Payments.
- Delivery agents.
- Delivery assignments.
- Coupons.
- Coupon redemptions.
- Favorites.
- Reviews.
- Notification subscriptions.
- Notification broadcasts.
- Audit logs.

Use historical snapshots inside orders.

---

# 28. API

Build REST endpoints according to `08_API_SPECIFICATION.md`.

Every endpoint:
- Validates input.
- Authenticates.
- Authorizes.
- Performs domain checks.
- Returns predictable errors.
- Logs critical events.

Use consistent response format.

---

# 29. UI QUALITY BAR

Do not ship:
- Broken mobile layout.
- Placeholder lorem ipsum.
- Dead buttons.
- Fake data presented as real functionality.
- Frontend-only validation.
- Missing empty/error states.
- Unhandled loading states.
- Inconsistent spacing.
- Generic template dashboard.

Every implemented feature must work end-to-end.

---

# 30. DEVELOPMENT ORDER

Implement in this sequence:

### Phase 1
Project setup + design system + routing.

### Phase 2
Database + authentication + RBAC.

### Phase 3
Catalog + categories + pricing + availability.

### Phase 4
Customer browsing + product customization + cart.

### Phase 5
Address/location + delivery calculation.

### Phase 6
Checkout + order creation + COD.

### Phase 7
Admin orders.

### Phase 8
Delivery partners + assignment + delivery completion.

### Phase 9
Notifications.

### Phase 10
Coupons/offers.

### Phase 11
Reviews + ratings + invoices.

### Phase 12
SEO/AEO.

### Phase 13
Analytics + audit logs.

### Phase 14
Testing/security/performance.

### Phase 15
Deployment.

---

# 31. IMPLEMENTATION RULES

1. Inspect existing repository before modifying anything.
2. Preserve working functionality.
3. Do not rewrite the entire application unnecessarily.
4. Use TypeScript strict mode.
5. Avoid `any` unless unavoidable and documented.
6. Keep domain logic outside UI components.
7. Use reusable components.
8. Use migrations for schema changes.
9. Seed realistic development data.
10. Never use production secrets in source control.
11. Never hard-code business prices in frontend code.
12. Never hard-code product availability in frontend code.
13. Never trust client totals.
14. Never expose unauthorized records.
15. Write tests for financial/business rules.
16. Keep feature flags explicit.
17. Keep external integrations behind adapters.
18. Document assumptions.
19. Do not implement future features unless requested.
20. Do not add unnecessary dependencies.

---

# 32. REQUIRED SEED DATA

Create development seed data:
- Admin account.
- Delivery-agent account.
- Sample customer.
- Categories.
- Chicken products.
- Eggs.
- Drinks.
- Masala products.
- Sample coupons.
- Sample orders in each state.

Clearly label all seeded credentials as development-only.

---

# 33. REQUIRED DEMO FLOW

A clean demo must be possible:

```text
Customer
 ↓
Register
 ↓
Use current location
 ↓
Browse
 ↓
Select 1kg chicken
 ↓
Customize
 ↓
Add Pepsi
 ↓
Checkout
 ↓
Apply coupon
 ↓
Select COD
 ↓
Place order
 ↓
Admin
 ↓
Confirm
 ↓
Preparing
 ↓
Assign delivery partner
 ↓
Delivery partner
 ↓
Open customer location
 ↓
Start delivery
 ↓
Mark delivered
 ↓
Customer
 ↓
Receives Delivered notification
 ↓
Rates order
```

---

# 34. FINAL ACCEPTANCE

Before declaring the project complete, verify every item in:

`19_ACCEPTANCE_CHECKLIST.md`

Do not claim production-ready status until:
- Build passes.
- Tests pass.
- Auth works.
- RBAC works.
- Orders work.
- Pricing is server-validated.
- Delivery calculation is server-validated.
- Coupons are server-validated.
- Delivery assignment works.
- Delivered workflow works.
- Notifications work.
- Mobile UX works.
- SEO metadata exists.
- Security checks pass.
