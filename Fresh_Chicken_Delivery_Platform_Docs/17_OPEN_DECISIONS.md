# Open Decisions

These items must be explicitly decided before being treated as immutable business rules.

---

## D-01 Delivery distance source

Options:
1. Straight-line geodesic distance.
2. Road distance from routing API.

Recommended for real delivery: road distance.

Status: OPEN.

---

## D-02 Delivery fee rounding

Example: 3.16km means 160m chargeable.

Options:
A. Exact: 160/100 × ₹1.50 = ₹2.40, then final currency rounding.
B. Every started 100m = ₹3.

Status: OPEN.

---

## D-03 Service boundary

Options:
A. Radius from shop.
B. Explicit Mulbagal service polygon/area.

Status: OPEN.

---

## D-04 Mixed meat minimum

Define whether:
- Any qualifying meat products totaling 1kg satisfy minimum.
- Only chicken SKU weight counts.
- Specific categories count.

Status: OPEN.

---

## D-05 20-minute promise

Decide whether the website should say:
- “Target delivery within approximately 20 minutes”
or
- “Delivery within 20 minutes.”

The second is a business guarantee and should only be used if operationally supportable.

Status: OPEN.

---

## D-06 Scheduled orders

Decide:
- ASAP only.
- Scheduled delivery.
- Both.

Status: OPEN.

---

## D-07 Cancellation

Define:
- Customer cancellation cutoff.
- Admin cancellation rules.
- Cancellation after preparation.
- Cancellation after dispatch.
- Refund rules.

Status: OPEN.

---

## D-08 Customer order-history storage

A fully device-only history prevents reliable cross-device synchronization.

Choose:
A. Device-only.
B. Minimal server-side history.
C. Server-side history with customer deletion/export controls.

Status: OPEN.

---

## D-09 Notification channel

Choose:
- Web Push.
- SMS.
- WhatsApp Business/API.
- Email.
- Multiple.

Marketing WhatsApp is subject to provider policies and user consent requirements.

Status: OPEN.

---

## D-10 Payment gateway

Choose later:
- Razorpay.
- Cashfree.
- PhonePe gateway.
- Other supported gateway.

Architecture must remain provider-agnostic.

Status: OPEN.

---

## D-11 Live agent tracking

V1 can use destination navigation without continuous tracking.

Decide later whether admin/customer should see agent live location.

Status: OPEN.

---

## D-12 Invoice/tax requirements

Confirm:
- Whether GST/tax is applicable.
- Invoice numbering requirements.
- Business address and tax information.

Status: OPEN.

---

## D-13 Business hours

Define:
- Opening time.
- Closing time.
- Days closed.
- Holiday handling.

Status: OPEN.
