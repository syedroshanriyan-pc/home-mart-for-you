# API Specification

REST-style API baseline.

---

## Authentication

### POST `/api/auth/register`
Input:
```json
{
  "name": "Customer",
  "mobile": "9999999999",
  "address": {
    "label": "Home",
    "addressLine": "Main Road",
    "latitude": 13.0,
    "longitude": 78.0
  }
}
```

### POST `/api/auth/login`
### POST `/api/auth/logout`
### GET `/api/auth/me`

---

## Catalog

### GET `/api/categories`
### GET `/api/products`
Query:
```text
category
search
available
page
limit
```

### GET `/api/products/:slug`

---

## Addresses

### GET `/api/me/addresses`
### POST `/api/me/addresses`
### PATCH `/api/me/addresses/:id`
### DELETE `/api/me/addresses/:id`

---

## Cart

Cart may be local, but server validation is required at checkout.

### POST `/api/cart/validate`

Input:
```json
{
  "items": [
    {
      "variantId": "variant-id",
      "quantity": 1,
      "customizations": []
    }
  ],
  "addressId": "address-id",
  "couponCode": "FRESH100",
  "paymentMethod": "COD"
}
```

Response should include:
- Valid/invalid.
- Subtotal.
- Qualifying meat grams.
- Delivery distance.
- Delivery fee.
- Discount.
- COD fee.
- Total.
- Validation messages.

---

## Orders

### POST `/api/orders`
Requires idempotency key.

### GET `/api/orders`
### GET `/api/orders/:id`
### POST `/api/orders/:id/cancel`
### POST `/api/orders/:id/reorder`

---

## Reviews

### POST `/api/orders/:id/review`
### GET `/api/me/reviews`

---

## Favorites

### GET `/api/me/favorites`
### POST `/api/me/favorites/:productId`
### DELETE `/api/me/favorites/:productId`

---

## Admin

### GET `/api/admin/dashboard`
### GET `/api/admin/orders`
### GET `/api/admin/orders/:id`
### POST `/api/admin/orders/:id/confirm`
### POST `/api/admin/orders/:id/cancel`
### POST `/api/admin/orders/:id/prepare`
### POST `/api/admin/orders/:id/assign-delivery`

---

## Admin Products

### POST `/api/admin/products`
### PATCH `/api/admin/products/:id`
### POST `/api/admin/products/:id/toggle-availability`
### POST `/api/admin/products/:id/price`

---

## Coupons

### GET `/api/admin/coupons`
### POST `/api/admin/coupons`
### PATCH `/api/admin/coupons/:id`
### POST `/api/admin/coupons/:id/toggle`

---

## Delivery Agent

### GET `/api/delivery/me`
### GET `/api/delivery/assignments`
### GET `/api/delivery/assignments/:id`
### POST `/api/delivery/assignments/:id/start`
### POST `/api/delivery/assignments/:id/deliver`

---

## Notifications

### POST `/api/admin/notifications/broadcast`
Input:
```json
{
  "title": "Weekend Offer",
  "message": "Get ₹100 OFF above ₹499."
}
```

### POST `/api/notifications/subscribe`
### DELETE `/api/notifications/subscribe/:id`

---

## Security

Every endpoint must enforce:
- Authentication.
- Authorization.
- Ownership/scope.
- Input validation.
- Rate limits where appropriate.

Never rely on frontend role hiding.
