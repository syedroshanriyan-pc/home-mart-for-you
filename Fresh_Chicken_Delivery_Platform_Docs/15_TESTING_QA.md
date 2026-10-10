# Testing & QA Strategy

---

## 1. Test Layers

1. Unit tests.
2. Domain/service tests.
3. API integration tests.
4. Database tests.
5. Permission tests.
6. End-to-end tests.
7. Responsive UI tests.
8. Accessibility tests.
9. Security tests.
10. Production smoke tests.

---

## 2. Critical Unit Tests

### Delivery
- 3km exactly → free.
- Below 3km → free.
- Above 3km → additional charge.
- 3.1km → calculated additional distance.
- 4km → ₹15 before any rounding rule.
- 5km → ₹30 before rounding.

### Minimum order
- 500g meat → reject.
- 1kg meat → accept.
- 1kg meat + drinks → accept.
- 500g meat + drinks → reject.

### COD
- COD → +₹7.
- Online payment → no COD fee.

### Coupons
Test every coupon type and invalid cases.

---

## 3. Order State Tests

Valid:
```text
PLACED → CONFIRMED
CONFIRMED → PREPARING
PREPARING → OUT_FOR_DELIVERY
OUT_FOR_DELIVERY → DELIVERED
```

Invalid:
```text
DELIVERED → PREPARING
DELIVERED → CANCELLED
OUT_FOR_DELIVERY → CONFIRMED
```

unless a specifically documented administrative recovery process exists.

---

## 4. Delivery Agent Tests

Agent A cannot:
- View Agent B's delivery.
- View another customer's order.
- Modify product prices.
- Create coupons.
- Access analytics.

Agent A can:
- View assigned delivery.
- Start assigned delivery.
- Mark assigned delivery delivered.

---

## 5. Admin Tests

Admin can:
- Toggle product availability.
- Change price.
- Confirm order.
- Assign agent.
- Create coupon.
- Broadcast notification.

Every action should create expected DB changes and audit events.

---

## 6. Customer Tests

Customer can:
- Register.
- Login.
- Browse.
- Customize.
- Add to cart.
- Select location.
- Checkout.
- Track order.
- Reorder.
- Favorite.
- Review.

Customer cannot:
- Modify another user's order.
- Change product prices.
- Mark order delivered.

---

## 7. E2E Critical Scenario

```text
Register
→ location
→ browse
→ add 1kg chicken
→ customize
→ checkout
→ coupon
→ COD
→ order created
→ admin confirms
→ preparing
→ assign agent
→ agent opens location
→ agent marks delivered
→ customer receives delivered event
→ customer rates
```

---

## 8. Security QA

Test:
- IDOR.
- Broken access control.
- Coupon manipulation.
- Price manipulation.
- Delivery fee manipulation.
- Order ownership.
- Notification authorization.
- File upload abuse.
- Authentication brute force.

---

## 9. Performance

Test:
- 100 concurrent browsing sessions.
- Order burst.
- Notification broadcast.
- Admin order list.
- Product catalog.

Scale test should reflect expected real traffic rather than arbitrary huge numbers.
