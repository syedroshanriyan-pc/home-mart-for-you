# Delivery Partner Specification

---

## 1. Purpose

Provide delivery workers with a secure, simple interface for assigned deliveries.

---

## 2. Access

Role:
`DELIVERY_AGENT`

The agent cannot access:
- Admin dashboard.
- Other agents' deliveries.
- Customer database.
- Analytics.
- Coupons.
- Pricing.
- Product management.

---

## 3. Dashboard

Show:
- Current active delivery.
- Assigned orders.
- Completed today.
- Availability.

---

## 4. Delivery Card

```text
Order #FC1024
Customer: Name
Address: ...
Distance: ...
Total: ...
Status: Assigned

[ VIEW ]
```

---

## 5. Delivery Details

Show:
- Customer name.
- Address.
- Delivery coordinates.
- Phone/contact action.
- Items.
- Quantity.
- Customization.
- Order total.
- Delivery instructions if provided.

Do not expose unrelated account data.

---

## 6. Navigation

`OPEN MAP` opens the configured map/navigation provider using the delivery destination.

Do not expose the customer's location to anyone other than authorized delivery/admin roles.

---

## 7. Status Actions

```text
ASSIGNED
 ↓
START DELIVERY
 ↓
OUT FOR DELIVERY
 ↓
MARK DELIVERED
```

The agent cannot set arbitrary statuses.

---

## 8. Mark Delivered

Require confirmation.

On confirmation:
- Transactionally mark order delivered.
- Store delivered timestamp.
- Store delivery-agent ID.
- Write audit event.
- Trigger notification event.
- Trigger rating prompt.

---

## 9. Agent Availability

```text
AVAILABLE
BUSY
OFFLINE
```

Assignment should normally target AVAILABLE agents.

---

## 10. Delivery Failure

Future but architecture-ready:
- Customer unavailable.
- Wrong address.
- Phone unreachable.
- Delivery refused.
- Shop issue.

Each failed attempt should have a reason and timestamp.

Do not allow agent to invent arbitrary cancellation state.

---

## 11. Privacy

Customer location is scoped to assigned order and operational duration.

Do not retain continuous location history unless the business explicitly requires it and privacy/legal requirements are addressed.
