# Product Requirements Document (PRD)
## Fresh Chicken Online Ordering & Delivery Platform

---

## 1. Product Vision

Build a premium local-commerce platform that allows customers in Mulbagal to discover Fresh Chicken, browse fresh meat and related products, customize chicken preparation, place delivery orders, track them, receive notifications and provide ratings.

The shop owner gets an operational admin system to manage products, prices, availability, orders, delivery partners, coupons, promotions, customers, reviews and reporting.

Delivery partners get a restricted operational portal for assigned orders and customer navigation.

---

## 2. Personas

### 2.1 Customer
A local customer who wants fresh chicken/meat and related products delivered quickly.

Goals:
- Find products quickly.
- Know today's prices.
- Confirm delivery availability.
- Order with minimal typing.
- Use current location.
- Customize chicken.
- Track order.
- Receive reliable status notifications.
- Reorder easily.

### 2.2 Owner/Admin
The shop owner/operator.

Goals:
- See incoming orders.
- Accept/reject/manage orders.
- Change daily prices.
- Toggle products in/out of stock.
- Create coupons.
- Assign delivery partners.
- Send promotional notifications.
- Manage customers and reviews.
- Understand sales and operational performance.

### 2.3 Delivery Partner
A shop delivery worker.

Goals:
- See assigned deliveries.
- Access customer location/address.
- View order contents.
- Navigate to customer.
- Mark delivery status.
- Complete deliveries quickly.

---

## 3. Product Goals

### P0 — Must have
- Customer authentication.
- Customer location capture.
- Product catalog.
- Product availability.
- Daily pricing.
- Chicken customization.
- Cart.
- Minimum 1kg meat validation.
- Checkout.
- Delivery charge calculation.
- COD with ₹7 fee.
- Order creation.
- Order tracking.
- Admin order management.
- Delivery partner management.
- Delivery assignment.
- Delivered confirmation.
- Customer delivery notification.
- Ratings/reviews.
- Coupons.
- Basic SEO/AEO.
- Promotional notification sending.
- Responsive premium UI.

### P1 — Should have
- Reorder.
- Favorites.
- Multiple addresses.
- Invoice download.
- Advanced analytics.
- Review moderation.
- Delivery-agent availability.
- Order search/filtering.
- Customer support/contact workflow.

### P2 — Future
- Loyalty points.
- Referral system.
- Advanced delivery live tracking.
- Automated stock quantity management.
- Native mobile apps.
- Sophisticated marketing segmentation.

---

## 4. Core Customer Journey

```text
Landing page
  ↓
Browse menu
  ↓
Select product
  ↓
Select quantity/customization
  ↓
Add to cart
  ↓
Login/register
  ↓
Choose current location / saved address
  ↓
Server validates serviceability
  ↓
Validate minimum 1kg meat
  ↓
Calculate delivery
  ↓
Apply coupon
  ↓
Choose payment
  ↓
Place order
  ↓
Order placed
  ↓
Track status
  ↓
Delivered
  ↓
Rate/review
```

---

## 5. Homepage Requirements

Sections:
1. Hero.
2. Today's Specials.
3. Offers.
4. Popular products.
5. Why Choose Fresh Chicken.
6. How ordering works.
7. Customer reviews.
8. Location/map.
9. Contact.
10. Footer.

The homepage must be:
- Mobile-first.
- Fast.
- SEO-ready.
- AEO-friendly.
- Accessible.
- Conversion-oriented.
- Premium/minimal-luxury.

---

## 6. Catalog Requirements

Each product can have:
- Name.
- Slug.
- Description.
- Images.
- Category.
- Product type.
- Price.
- Pricing unit.
- Availability.
- Customization rules.
- Offer eligibility.
- SEO metadata.
- Display order.

Pricing types:
- Weight.
- Piece.
- Fixed/unit.

---

## 7. Location Requirements

Customer can:
1. Use current location.
2. Pick a point on map.
3. Confirm detected address.
4. Save address label.
5. Edit address manually if geocoding is imperfect.

The system stores only the minimum address/location information necessary for delivery.

Server validates:
- Coordinates are valid.
- Location is within configured service policy.
- Delivery distance and fee.

---

## 8. Delivery Requirements

Rule:
- First 3 km free.
- Beyond 3 km: ₹1.50 per 100 metres.

Formula:

```text
chargeable_distance_m = max(0, delivery_distance_m - 3000)

delivery_fee =
    chargeable_distance_m / 100 * 1.50
```

The final rounding policy is an open business decision.

The shop's service boundary must be configurable. Mulbagal is the initial service market.

---

## 9. Minimum Order

The cart must contain at least 1 kg of qualifying meat/chicken.

The validation must not simply use total rupee value.

Example:
- 500g chicken + beverages = invalid.
- 500g chicken + 500g chicken = valid.
- 1kg chicken + eggs = valid.

The exact treatment of mixed meat SKUs is an open decision.

---

## 10. Order Tracking

Customer sees:

```text
Order Placed
    ↓
Confirmed
    ↓
Preparing
    ↓
Out for Delivery
    ↓
Delivered
```

Delivered is terminal.

The system records timestamps for each transition.

---

## 11. Notification Requirements

Transactional notifications should be triggered from backend events.

Marketing notifications are manually created from admin.

Marketing send flow:

```text
Admin
 ↓
Notifications
 ↓
Compose message
 ↓
Select eligible audience
 ↓
Send
 ↓
Notification service
 ↓
Active customer devices/subscriptions
```

Users must be able to opt out of marketing notifications where required by the chosen notification channel.

---

## 12. Acceptance Principles

A feature is complete only when:
- Customer UI works.
- Backend validates it.
- Database state is correct.
- Unauthorized users cannot access it.
- Error cases are handled.
- Mobile layout works.
- Loading/empty/error states exist.
- Acceptance criteria are testable.
