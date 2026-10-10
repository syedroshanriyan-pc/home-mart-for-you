# Database Design

---

## 1. Core Principle

Use PostgreSQL for transactional integrity.

---

## 2. Entity Overview

```text
User
 ├── Address
 ├── Order
 ├── Favorite
 ├── Review
 └── NotificationSubscription

Product
 ├── Category
 ├── ProductVariant
 ├── CustomizationGroup
 └── ProductAvailability

Order
 ├── OrderItem
 ├── AddressSnapshot
 ├── Payment
 ├── CouponRedemption
 ├── DeliveryAssignment
 └── StatusHistory

DeliveryAgent
 └── DeliveryAssignment

Coupon
 └── CouponRedemption

NotificationBroadcast
 └── NotificationDelivery

AdminUser
 └── AuditLog
```

---

## 3. Suggested Tables

### users
```text
id
role
name
mobile
email nullable
status
created_at
updated_at
last_login_at
```

Roles:
- CUSTOMER
- ADMIN
- SUPER_ADMIN
- DELIVERY_AGENT
- STAFF roles can be added later.

### addresses
```text
id
user_id
label
address_line
locality
city
postal_code nullable
latitude
longitude
is_default
created_at
updated_at
```

### categories
```text
id
name
slug
description
image_url
is_active
display_order
created_at
updated_at
```

### products
```text
id
category_id
name
slug
description
product_type
is_active
is_available
image_url
seo_title
seo_description
created_at
updated_at
```

### product_variants
```text
id
product_id
name
pricing_type
quantity_value
quantity_unit
price_minor
is_available
created_at
updated_at
```

Pricing type:
- WEIGHT
- PIECE
- FIXED

### customization_groups
```text
id
product_id
name
selection_type
is_required
```

### customization_options
```text
id
group_id
name
price_delta_minor
is_active
```

### orders
```text
id
order_number
user_id
status
subtotal_minor
discount_minor
delivery_fee_minor
cod_fee_minor
total_minor
delivery_distance_meters
delivery_latitude
delivery_longitude
delivery_address_snapshot
coupon_id nullable
placed_at
confirmed_at nullable
preparing_at nullable
out_for_delivery_at nullable
delivered_at nullable
cancelled_at nullable
created_at
updated_at
```

### order_items
```text
id
order_id
product_id
variant_id
product_name_snapshot
variant_name_snapshot
quantity
weight_grams nullable
unit_price_minor
line_total_minor
customization_snapshot_json
```

Snapshots protect historical order integrity when products/prices change.

### payments
```text
id
order_id
method
status
amount_minor
provider
provider_reference nullable
created_at
updated_at
```

### delivery_agents
Use users with `DELIVERY_AGENT` role, plus:
```text
agent_profile_id
user_id
availability_status
last_known_latitude nullable
last_known_longitude nullable
is_active
```

### delivery_assignments
```text
id
order_id
agent_user_id
assigned_at
accepted_at nullable
started_at nullable
delivered_at nullable
```

### coupons
```text
id
code
type
value
minimum_order_minor nullable
maximum_discount_minor nullable
buy_quantity nullable
get_quantity nullable
free_delivery boolean
usage_limit nullable
per_user_limit nullable
starts_at
expires_at
is_active
created_by
created_at
updated_at
```

### coupon_redemptions
```text
id
coupon_id
user_id
order_id
discount_minor
created_at
```

### favorites
```text
user_id
product_id
created_at
```

### reviews
```text
id
user_id
order_id
rating
comment
status
created_at
updated_at
```

Review status:
- PENDING
- PUBLISHED
- HIDDEN

### notification_subscriptions
```text
id
user_id nullable
provider
endpoint_or_token
device_label nullable
is_active
created_at
updated_at
```

### notification_broadcasts
```text
id
created_by
title
message
status
recipient_count
success_count
failure_count
created_at
completed_at nullable
```

### audit_logs
```text
id
actor_user_id
action
entity_type
entity_id
metadata_json
created_at
```

---

## 4. Data Minimization

Do not create tables for:
- Detailed browsing history unless explicitly required.
- Behavioral profiling.
- Unnecessary location history.
- Unnecessary device telemetry.

For delivery, store the location snapshot needed to fulfill the order.

---

## 5. Order Price Integrity

Historical order item data must contain snapshots.

Never calculate an old invoice from today's product table.

---

## 6. Indexes

At minimum:
- users.mobile
- products.slug
- products.category_id
- products.is_available
- orders.order_number
- orders.user_id
- orders.status
- orders.created_at
- delivery_assignments.agent_user_id
- coupons.code
- reviews.order_id
- notification_subscriptions.user_id
