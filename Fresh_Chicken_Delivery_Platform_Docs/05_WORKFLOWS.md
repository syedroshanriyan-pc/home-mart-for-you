# End-to-End Workflows

---

## 1. Customer Registration

```text
Open website
 ↓
Sign up
 ↓
Name + mobile
 ↓
Location permission
 ↓
Current location / map pin
 ↓
Reverse geocoding
 ↓
Customer confirms address
 ↓
Account created
 ↓
Home
```

Fallback:
- If location denied, allow manual address entry where business policy permits.
- Do not block all account creation solely because browser geolocation is unavailable unless delivery requires coordinates.

---

## 2. Browse and Cart

```text
Home
 ↓
Category
 ↓
Product
 ↓
Select variant/weight
 ↓
Select customization
 ↓
Add to cart
```

At cart:
- Validate availability.
- Validate current price.
- Calculate qualifying meat weight.
- Calculate subtotal.

---

## 3. Checkout

```text
Cart
 ↓
Minimum meat requirement
 ↓
Select address
 ↓
Server determines distance
 ↓
Delivery fee
 ↓
Apply coupon
 ↓
COD fee if applicable
 ↓
Final total
 ↓
Payment
 ↓
Create order
```

Final total must be recalculated server-side.

---

## 4. Delivery Calculation

```text
Shop coordinates
       +
Customer delivery coordinates
       ↓
Distance service
       ↓
distance
       ↓
if distance <= 3km:
    delivery = 0
else:
    delivery = (distance - 3km) × ₹1.50 / 100m
```

The exact routing method and rounding rule are defined in `17_OPEN_DECISIONS.md`.

---

## 5. Admin Order Flow

```text
New order
 ↓
Review
 ├── Reject/cancel
 └── Confirm
       ↓
   Preparing
       ↓
   Ready / assign delivery
       ↓
   Delivery partner assigned
```

---

## 6. Delivery Partner Flow

```text
Login
 ↓
Assigned delivery
 ↓
View customer
 ↓
Open map/navigation
 ↓
Start delivery
 ↓
Deliver
 ↓
Confirm delivered
 ↓
Order = DELIVERED
```

---

## 7. Delivered Event

When delivery partner confirms:

```text
DB transaction
 ├── order.status = DELIVERED
 ├── delivered_at = now
 ├── delivery_partner_id = agent
 └── audit event

Then dispatch:
 ├── customer delivered notification
 └── rating/review prompt
```

Notification failure must not roll back an already completed delivery.

---

## 8. Reorder

```text
Previous order
 ↓
Reorder
 ↓
Fetch current product records
 ↓
Check availability
 ↓
Use current prices
 ↓
Rebuild cart
 ↓
Checkout
```

Never reuse historical prices as current prices.

---

## 9. Coupon Workflow

```text
Customer enters coupon
 ↓
Backend validates
 ├── Exists?
 ├── Active?
 ├── Date valid?
 ├── Usage valid?
 ├── Minimum order met?
 ├── Product/category rules met?
 └── Customer eligible?
 ↓
Calculate discount
 ↓
Return preview
 ↓
Revalidate during order creation
```

---

## 10. Admin Broadcast

```text
Admin
 ↓
Create message
 ↓
Validate permissions
 ↓
Select eligible notification subscribers
 ↓
Create broadcast record
 ↓
Queue/send notifications
 ↓
Track success/failure counts
```

Use batching/queueing for scale rather than sending hundreds of requests synchronously in one web request.

---

## 11. V1 Simulation

Development/demo only:

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

The simulation must be feature-flagged and disabled for production.

---

## 12. Cancellation

Cancellation policy must be configurable.

Recommended technical model:
- Customer may cancel only while status is `PLACED`, unless business policy says otherwise.
- Admin can cancel under permitted conditions.
- Delivery partner cannot cancel orders.
- Every cancellation requires a reason.
- Payment/refund behavior is delegated to payment integration once implemented.
