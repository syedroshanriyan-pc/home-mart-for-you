# Security & Privacy Specification

---

## 1. Authentication

Use secure authentication.

Requirements:
- Passwords hashed using modern password hashing.
- Secure session handling.
- Session expiry.
- Logout/revocation.
- Rate limits on login.
- Protection against credential stuffing.

---

## 2. Authorization

Enforce authorization on the server.

Example:
```text
CUSTOMER
  → own account/orders

DELIVERY_AGENT
  → assigned deliveries only

ORDER_MANAGER
  → orders

ADMIN
  → configured operational modules

SUPER_ADMIN
  → full administration
```

Frontend route hiding is not security.

---

## 3. Customer Privacy

Store only necessary:
- Name.
- Mobile.
- Delivery information.
- Active/required order information.
- Payment references.
- Notification subscription where opted in/required.

Do not store:
- Unnecessary browsing history.
- Continuous location history.
- Unnecessary personal profiling.

---

## 4. Delivery Partner Privacy

Agent gets:
- Assigned customer name.
- Assigned address.
- Assigned coordinates.
- Assigned order details.

Agent does not get unrelated customer data.

---

## 5. Input Security

Protect against:
- SQL injection.
- XSS.
- CSRF where applicable.
- SSRF.
- Path traversal.
- Malicious file upload.
- Mass assignment.
- IDOR/BOLA.

---

## 6. Business Logic Security

Server must calculate:
- Prices.
- Discounts.
- Delivery fees.
- COD fees.
- Minimum order.
- Product availability.
- Coupon validity.

Never trust browser-calculated totals.

---

## 7. Payment Security

When integrated:
- Verify gateway signatures.
- Process webhooks idempotently.
- Never trust client payment-success state.
- Never store raw card credentials.

---

## 8. Notification Security

Admin broadcast endpoint requires admin authorization.

Rate limit broadcast creation.

Store audit event:
- Actor.
- Message.
- Time.
- Recipient estimate.
- Result counts.

---

## 9. Audit

Audit:
- Admin login.
- Price changes.
- Availability changes.
- Order status changes.
- Delivery assignment.
- Coupon creation/edit.
- Notification broadcasts.
- Settings changes.

---

## 10. Data Retention

Define retention periods based on actual business/legal needs.

Do not retain everything indefinitely simply because storage is cheap.
