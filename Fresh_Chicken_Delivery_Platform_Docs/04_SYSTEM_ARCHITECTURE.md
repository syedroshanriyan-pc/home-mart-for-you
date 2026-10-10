# System Architecture

---

## 1. Recommended Architecture

Use a modular monolith for V1.

Suggested stack:

```text
Frontend
Next.js + TypeScript
Tailwind CSS
Accessible component system

Backend
Next.js server/API layer OR separate Node.js API
TypeScript

Database
PostgreSQL
Prisma ORM

Authentication
Secure session / JWT strategy appropriate to deployment

Storage
Object storage for product images and invoices if needed

Maps
Geocoding + routing provider

Notifications
Web Push and/or managed notification service

Payments
Gateway abstraction; integrate provider later

Hosting
Managed frontend/backend + managed PostgreSQL
```

The architecture should remain provider-agnostic where possible.

---

## 2. High-Level Diagram

```text
                    ┌──────────────────────┐
                    │      CUSTOMER        │
                    │  Web / PWA           │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │ APPLICATION / API    │
                    │                      │
                    │ Auth                 │
                    │ Catalog              │
                    │ Cart                 │
                    │ Orders               │
                    │ Pricing              │
                    │ Delivery             │
                    │ Coupons              │
                    │ Reviews              │
                    │ Notifications        │
                    │ Admin                │
                    └──────┬───────┬───────┘
                           │       │
                 ┌─────────┘       └──────────┐
                 ▼                            ▼
       ┌─────────────────┐          ┌──────────────────┐
       │ PostgreSQL      │          │ External Services│
       │ Users           │          │ Maps             │
       │ Products        │          │ Payments         │
       │ Orders          │          │ Notifications    │
       │ Delivery        │          │ Storage          │
       └─────────────────┘          └──────────────────┘
                 ▲
                 │
       ┌─────────┴──────────┐
       │                    │
       │                    │
┌──────┴──────┐     ┌───────┴────────┐
│ ADMIN PANEL  │     │ DELIVERY PORTAL│
└─────────────┘     └────────────────┘
```

---

## 3. Architectural Layers

```text
Presentation
  ↓
Route/API handlers
  ↓
Application services / use cases
  ↓
Domain rules
  ↓
Repositories
  ↓
Database
```

External integrations should be behind adapters/interfaces.

Examples:
- `MapProvider`
- `PaymentProvider`
- `NotificationProvider`
- `StorageProvider`

This prevents vendor lock-in.

---

## 4. Domain Modules

```text
auth
users
addresses
catalog
categories
pricing
cart
orders
order-items
delivery
delivery-agents
coupons
promotions
reviews
notifications
invoices
analytics
admin
settings
audit
```

---

## 5. State Management

Customer:
- Server state through query/cache mechanism.
- Local cart/preferences through browser/device storage.
- Avoid storing sensitive authentication tokens in unsafe browser storage.

Admin:
- Server state.
- Real-time or short polling for new orders if required.

Delivery:
- Server state scoped to assigned orders.
- Location permissions only when needed.

---

## 6. Order State Machine

```text
PLACED
  ├──> CANCELLED
  │
  └──> CONFIRMED
          └──> PREPARING
                  └──> OUT_FOR_DELIVERY
                          └──> DELIVERED
```

Only authorized roles can transition states.

---

## 7. Simulation Architecture

```text
OrderService
   │
   ├── RealWorkflowStrategy
   │      Admin/agent controls status
   │
   └── SimulationWorkflowStrategy
          5-minute demo transitions
```

Do not implement simulation with frontend timers that mutate only the UI.

Simulation state must be server-recognizable so refreshes do not corrupt status.

---

## 8. Notification Architecture

```text
Domain Event
   ↓
Notification Dispatcher
   ├── Customer transactional notification
   ├── Admin notification
   └── Marketing broadcast
```

Examples:
- `ORDER_PLACED`
- `PAYMENT_CONFIRMED`
- `ORDER_CONFIRMED`
- `ORDER_PREPARING`
- `ORDER_OUT_FOR_DELIVERY`
- `ORDER_DELIVERED`
- `ORDER_CANCELLED`
- `MARKETING_BROADCAST`

---

## 9. Scalability

A modular monolith is sufficient for expected scale.

Future extraction candidates only if needed:
- Notification worker.
- Image processing.
- Analytics pipeline.
- Search.
- Payment webhook processor.

Do not start with microservices.
