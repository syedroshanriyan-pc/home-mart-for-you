# Technical Requirements Document (TRD)

---

## 1. Recommended Technology

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Accessible component primitives
- Responsive/PWA-capable architecture

### Backend
- TypeScript
- Modular server/API layer
- PostgreSQL
- Prisma

### Infrastructure
- Managed PostgreSQL.
- Managed application hosting.
- Object storage/CDN for images.
- Notification provider.
- Map/geocoding/routing provider.
- Payment gateway later.

---

## 2. Repository Structure

```text
fresh-chicken/
├── apps/
│   ├── web/
│   ├── admin/
│   └── delivery/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── domain/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
├── tests/
├── scripts/
└── README.md
```

A single Next.js application with protected route areas is also acceptable for V1 if it keeps boundaries clear:

```text
/customer
/admin
/delivery
```

Do not create separate deployables solely for aesthetics.

---

## 3. Validation

Use schema validation at API boundaries.

Validate:
- Phone.
- Address.
- Coordinates.
- Product IDs.
- Quantities.
- Weight.
- Coupon code.
- Order state transitions.
- IDs.
- Pagination.
- Search input.

---

## 4. Money

Never use floating point for monetary calculations.

Use integer minor units:
```text
₹250.00 → 25000 paise
```

Delivery fee:
- ₹1.50 → 150 paise.

Final rounding must be deterministic and documented.

---

## 5. Weight

Use integer grams.

Examples:
```text
500g → 500
1kg → 1000
```

Avoid floating-point kilograms.

---

## 6. Distance

Use integer metres internally.

Examples:
```text
3km → 3000m
3.5km → 3500m
```

---

## 7. Time

Store timestamps in UTC.

Display in:
`Asia/Kolkata`

---

## 8. Concurrency

Order creation must:
1. Re-read current product price.
2. Re-check availability.
3. Recalculate discounts.
4. Recalculate delivery.
5. Validate minimum meat quantity.
6. Create order atomically.

Use transactions.

---

## 9. Idempotency

Order creation endpoint should accept an idempotency key.

Payment webhooks must be idempotent.

Notification broadcast jobs must avoid duplicate sends where provider supports message IDs.

---

## 10. Caching

Safe candidates:
- Public product catalog.
- Categories.
- Public homepage data.
- SEO content.

Do not cache customer-specific sensitive data publicly.

---

## 11. Search

V1 can use PostgreSQL search/ILIKE for modest catalog size.

Do not add Elasticsearch/OpenSearch unless actual search complexity requires it.

---

## 12. Real-time Updates

Options:
- Short polling.
- Server-sent events.
- WebSocket.

For 30–300 orders/day, short polling or SSE is sufficient.

---

## 13. Image Handling

Product images:
- Resize/compress.
- Web-friendly formats.
- CDN.
- Alt text.
- Multiple responsive sizes.

---

## 14. Configuration

Environment variables:
```text
DATABASE_URL
AUTH_SECRET
APP_URL
MAPS_API_KEY
GEOCODING_API_KEY
NOTIFICATION_PROVIDER_KEY
PAYMENT_PROVIDER_KEY
STORAGE_BUCKET
```

Never commit secrets.

---

## 15. Feature Flags

At minimum:
```text
ORDER_SIMULATION_ENABLED
PAYMENTS_ENABLED
MARKETING_NOTIFICATIONS_ENABLED
LIVE_DELIVERY_ENABLED
```

---

## 16. Production Logging

Log:
- Request ID.
- User ID where appropriate.
- Order ID.
- Admin action.
- Delivery-agent action.
- Payment event.
- Notification event.
- Error class.

Do not log:
- Passwords.
- Authentication secrets.
- Full payment credentials.
- Sensitive tokens.
