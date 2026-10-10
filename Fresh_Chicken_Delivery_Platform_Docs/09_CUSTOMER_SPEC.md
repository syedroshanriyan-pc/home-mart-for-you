# Customer Website Specification

---

## 1. Pages

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
 /contact
 /about
 /location
```

---

## 2. Home

Required:
- Premium hero.
- Today's Specials.
- Offers.
- Popular products.
- Why Choose Fresh Chicken.
- How it works.
- Reviews.
- Location/map.
- Contact.
- Footer.

CTA:
- Order Now.
- View Menu.

---

## 3. Product Card

Display:
- Image.
- Name.
- Current price.
- Unit.
- Availability.
- Add button.
- Favorite control.

Unavailable:
- Show `OUT OF STOCK`.
- Disable ordering.

---

## 4. Product Details

Display:
- Product image gallery.
- Name.
- Description.
- Current price.
- Variant/weight selector.
- Customization controls.
- Availability.
- Add to cart.

---

## 5. Cart

Show:
- Items.
- Quantity.
- Customizations.
- Current price.
- Subtotal.
- Meat weight.
- Minimum-order validation.
- Coupon field.
- Delivery preview after address is selected.
- COD fee where applicable.
- Total.

---

## 6. Checkout

Steps:
1. Address.
2. Delivery calculation.
3. Order summary.
4. Payment.
5. Confirmation.

---

## 7. Order Tracking

Show:
```text
Order Placed
Confirmed
Preparing
Out for Delivery
Delivered
```

Include:
- Order number.
- Items.
- Total.
- Delivery address.
- Agent information only when business policy allows.
- Estimated/target delivery time.
- Rating prompt after delivery.

---

## 8. Account

Show only useful customer information:
- Name.
- Mobile.
- Saved addresses.
- Orders.
- Favorites.
- Reviews.
- Notification preferences.

---

## 9. Mobile UX

Primary design target:
- Mobile width 320–430px.

Touch targets:
- Prefer at least 44px.
- Avoid tiny text.
- Sticky cart/checkout controls where useful.

---

## 10. Location UX

Preferred flow:
```text
Use Current Location
      ↓
Map
      ↓
Detected address
      ↓
Confirm
```

Fallback:
```text
Pick on map
```

Manual correction should remain available.

---

## 11. Notifications

Customer sees:
- Order status notifications.
- Marketing notifications if subscribed.

Marketing notification should deep-link into relevant offer/menu page.
