# Admin Panel Specification

This is the operational control center.

---

## 1. Admin Navigation

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

---

## 2. Dashboard

Cards:
- Today's sales.
- Today's orders.
- Pending orders.
- Preparing.
- Out for delivery.
- Delivered.
- Cancelled.
- Average order value.

Charts:
- Orders by hour/day.
- Sales trend.
- Top products.
- Delivery performance.

Operational panel:
- New orders.
- Orders approaching 20-minute target.
- Unassigned deliveries.
- Low availability/out-of-stock products.

---

## 3. Orders

Filters:
- Status.
- Date.
- Payment method.
- Delivery agent.
- Customer.
- Order number.

Order card:
```text
#FC1024
Customer
Time
Items
Total
Payment
Status
Delivery agent
```

Actions depend on status.

---

## 4. Order Details

Show:
- Customer.
- Address.
- Location.
- Items.
- Customizations.
- Price snapshots.
- Discount.
- Delivery fee.
- COD fee.
- Total.
- Payment status.
- Status timeline.
- Delivery partner.
- Audit history.

---

## 5. Order Actions

Allowed examples:
```text
PLACED → CONFIRM
PLACED → CANCEL

CONFIRMED → PREPARING
CONFIRMED → CANCEL if business policy allows

PREPARING → OUT_FOR_DELIVERY / READY
OUT_FOR_DELIVERY → DELIVERED
```

Do not allow arbitrary transitions.

---

## 6. Delivery Management

### Agent list
Columns:
- Name.
- Phone.
- Status.
- Active order.
- Today's completed deliveries.

Statuses:
- AVAILABLE.
- BUSY.
- OFFLINE.
- INACTIVE.

### Add agent
Admin enters:
- Name.
- Mobile.
- Authentication setup.
- Active/inactive.

### Assignment
Admin selects available agent.

---

## 7. Products

Product fields:
- Name.
- Category.
- Description.
- Images.
- Product type.
- Variants.
- Current price.
- Availability.
- Customizations.
- SEO title.
- SEO description.

---

## 8. Inventory

V1 is manual availability.

```text
Chicken 1kg      IN STOCK
Wings             OUT OF STOCK
Farm Eggs         IN STOCK
```

One-click toggle:
- Enable.
- Disable.

Customer sees out-of-stock state immediately after cache/API refresh.

---

## 9. Pricing

Admin can change daily price.

Example:
```text
Chicken 1kg
Current: ₹240
New: ₹255
Effective: Today
```

Keep price history.

Never mutate historical order prices.

---

## 10. Coupons

Admin can:
- Create.
- Edit.
- Disable.
- Set date.
- Set usage limits.
- Set minimum order.
- Set fixed/percentage/free-delivery/buy-X-get-Y type.

---

## 11. Customers

Show minimal operational data:
- Name.
- Mobile.
- Account status.
- Current/active orders.
- Order count/summary only where operationally justified.
- Notification subscription status.

Avoid exposing unnecessary private data.

---

## 12. Reviews

Filters:
- Pending.
- Published.
- Hidden.
- Rating.

Actions:
- Publish.
- Hide.

---

## 13. Notifications

### Send Offer
Fields:
- Title.
- Message.
- Optional destination URL.
- Audience = eligible active subscribers.

Button:
`SEND NOW`

Before send:
- Show recipient estimate.
- Confirm action.

After:
- Show sent count.
- Failed count.
- Invalid subscription count.

---

## 14. Analytics

Metrics:
- Sales.
- Orders.
- AOV.
- Products.
- Coupons.
- Delivery times.
- Cancellations.
- Ratings.

---

## 15. Staff / RBAC

Suggested roles:
- SUPER_ADMIN.
- ADMIN.
- ORDER_MANAGER.
- KITCHEN_STAFF.
- DELIVERY_MANAGER.
- DELIVERY_AGENT.

Permissions should be explicit rather than role-name assumptions.

---

## 16. Settings

Sections:
- Shop profile.
- Shop location.
- Delivery radius.
- Delivery pricing.
- COD fee.
- Minimum meat order.
- Target delivery time.
- Business hours.
- Holidays.
- Notification settings.
- Payment settings.
- SEO settings.
- Feature flags.

---

## 17. Audit Log

Record:
- Who changed price.
- Who changed stock.
- Who changed coupon.
- Who changed order status.
- Who assigned delivery.
- Who sent broadcast.
- Who changed settings.
