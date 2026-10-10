# Business Requirements Document (BRD)
## Fresh Chicken

---

## 1. Business Context

Fresh Chicken is a local fresh-chicken retail business seeking online presence and direct local ordering/delivery capability.

The system should reduce manual order handling, make daily product pricing visible, improve delivery coordination, and create a direct customer relationship without requiring a third-party marketplace.

---

## 2. Business Objectives

### BO-01
Establish a professional online presence for Fresh Chicken.

### BO-02
Allow local customers to order online.

### BO-03
Support fast local delivery with a target of approximately 20 minutes.

### BO-04
Make daily market-driven pricing manageable by shop staff.

### BO-05
Give staff a central order-management interface.

### BO-06
Provide delivery partners with only the information required for assigned deliveries.

### BO-07
Enable owner-controlled offers/coupons.

### BO-08
Enable owner-triggered promotional notifications.

### BO-09
Build a foundation that can scale from 30–150 orders/day toward approximately 300 orders/day.

---

## 3. Revenue Model

Primary:
- Product sales.

Additional:
- COD surcharge of ₹7.
- Delivery fees beyond 3 km.
- Promotional campaigns intended to increase order frequency.

No subscription or marketplace commission model in V1.

---

## 4. Operational Model

```text
Customer places order
        ↓
System validates order
        ↓
Admin receives order
        ↓
Admin confirms
        ↓
Shop prepares
        ↓
Delivery partner assigned
        ↓
Partner delivers
        ↓
Partner marks delivered
        ↓
Customer notified
        ↓
Customer rates/reviews
```

---

## 5. Business Rules

### BR-01 Minimum order
At least 1 kg qualifying meat/chicken.

### BR-02 Delivery
First 3 km free.

### BR-03 Additional distance
₹1.50 per 100 metres beyond 3 km.

### BR-04 COD
₹7 surcharge.

### BR-05 Product availability
Admin manually toggles availability.

### BR-06 Daily price
Admin can change current product price.

### BR-07 Coupons
Admin creates and manages coupons.

### BR-08 Delivery agents
Admin creates and manages delivery-agent accounts.

### BR-09 Delivery visibility
Agent only sees assigned delivery information.

### BR-10 Delivery completion
Agent marking delivered changes the customer-facing order to Delivered and triggers notification/rating request.

### BR-11 Marketing notification
Admin can compose a promotional message and send it to eligible active notification subscribers.

---

## 6. Business KPIs

Suggested metrics:
- Orders/day.
- Gross sales/day.
- Average order value.
- Delivery time.
- Orders delivered within target.
- Cancellation rate.
- Coupon redemption.
- Repeat-order rate.
- Out-of-stock frequency.
- Customer rating.
- Delivery-agent completion rate.
- Notification delivery/open rate where technically available.

---

## 7. Operational Risks

| Risk | Mitigation |
|---|---|
| Incorrect customer GPS | Confirm pin + editable address |
| Wrong delivery fee | Server-side calculation |
| Price changes after cart | Revalidate price at checkout |
| Product becomes unavailable | Server-side availability validation |
| Agent sees too much data | RBAC + scoped APIs |
| Fake coupon manipulation | Server-side coupon validation |
| Duplicate orders | Idempotency key |
| Duplicate payment webhook | Webhook idempotency |
| Notification spam | Marketing controls/opt-out |
| 20-minute target missed | Timestamp tracking and operational analytics |

---

## 8. Scalability

Initial architecture should comfortably support:
- 30–150 orders/day.
- Growth toward ~300 orders/day.
- Traffic spikes around promotions.

Do not introduce distributed systems unless actual load justifies them.
