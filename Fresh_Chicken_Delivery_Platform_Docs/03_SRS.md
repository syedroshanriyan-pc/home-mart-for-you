# Software Requirements Specification (SRS)

---

## 1. Functional Requirements

### Authentication
- FR-AUTH-01 Register customer.
- FR-AUTH-02 Login customer.
- FR-AUTH-03 Secure session management.
- FR-AUTH-04 Admin login.
- FR-AUTH-05 Delivery-agent login.
- FR-AUTH-06 Role-based authorization.

### Customer
- FR-CUS-01 Browse categories.
- FR-CUS-02 Search products.
- FR-CUS-03 View product.
- FR-CUS-04 Select quantity.
- FR-CUS-05 Configure chicken preparation.
- FR-CUS-06 Add/remove cart items.
- FR-CUS-07 Save addresses.
- FR-CUS-08 Use current location.
- FR-CUS-09 Calculate delivery.
- FR-CUS-10 Apply coupon.
- FR-CUS-11 Place order.
- FR-CUS-12 View order status.
- FR-CUS-13 View/retrieve invoice.
- FR-CUS-14 Reorder.
- FR-CUS-15 Favorite products.
- FR-CUS-16 Rate/review completed order.
- FR-CUS-17 Receive notifications.

### Admin
- FR-ADM-01 View dashboard.
- FR-ADM-02 Manage orders.
- FR-ADM-03 Confirm/reject orders.
- FR-ADM-04 Update order status.
- FR-ADM-05 Manage products.
- FR-ADM-06 Toggle product availability.
- FR-ADM-07 Change prices.
- FR-ADM-08 Manage categories.
- FR-ADM-09 Create coupons.
- FR-ADM-10 Manage offers.
- FR-ADM-11 Manage customers.
- FR-ADM-12 Add delivery agents.
- FR-ADM-13 Assign delivery agents.
- FR-ADM-14 View delivery status.
- FR-ADM-15 Moderate reviews.
- FR-ADM-16 Send marketing notifications.
- FR-ADM-17 View analytics.
- FR-ADM-18 Manage system settings.

### Delivery Partner
- FR-DEL-01 Login.
- FR-DEL-02 View assigned deliveries.
- FR-DEL-03 View customer delivery location.
- FR-DEL-04 View order details required for delivery.
- FR-DEL-05 Open navigation.
- FR-DEL-06 Mark out for delivery.
- FR-DEL-07 Mark delivered.
- FR-DEL-08 View completed deliveries.

---

## 2. Non-functional Requirements

### NFR-01 Security
All protected APIs require authenticated authorization.

### NFR-02 Performance
Typical customer pages should target fast load and interaction on normal mobile networks.

### NFR-03 Availability
Production service should use managed infrastructure with backups.

### NFR-04 Accessibility
Use semantic HTML, keyboard accessibility and adequate contrast.

### NFR-05 Responsive
Support phone, tablet and desktop.

### NFR-06 Auditability
Admin-sensitive actions should have audit records.

### NFR-07 Data minimization
Do not collect/store data without a business requirement.

### NFR-08 Reliability
Order creation must be transactional and idempotent.

### NFR-09 Maintainability
Separate UI, application/domain logic, persistence and integrations.

### NFR-10 Observability
Production errors and critical business events must be logged.

---

## 3. Error Handling

Every major workflow needs:
- Loading state.
- Empty state.
- Validation state.
- Network failure state.
- Permission denied state.
- Server error state.
- Retry path.

Do not display raw stack traces to users.
