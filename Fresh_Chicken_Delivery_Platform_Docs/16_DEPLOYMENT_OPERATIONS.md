# Deployment & Operations

---

## 1. Environments

```text
Development
    ↓
Staging
    ↓
Production
```

Never test payment/notification changes directly in production.

---

## 2. CI/CD

Pipeline:
```text
Push
 ↓
Lint
 ↓
Typecheck
 ↓
Unit tests
 ↓
Build
 ↓
Integration tests
 ↓
Deploy staging
 ↓
Smoke test
 ↓
Production approval
```

---

## 3. Database

Requirements:
- Managed PostgreSQL.
- Automated backups.
- Migration system.
- Restore procedure.
- Production migration review.

---

## 4. Secrets

Use environment secret management.

Never commit:
- API keys.
- Database passwords.
- Auth secrets.
- Payment secrets.
- Notification provider secrets.

---

## 5. Monitoring

Track:
- API errors.
- Order creation failures.
- Payment failures.
- Notification failures.
- Delivery status anomalies.
- Database errors.
- Response latency.

---

## 6. Business Alerts

Admin/owner should be alerted when:
- New order is stuck.
- Delivery assignment is missing.
- Order approaches target delivery time.
- Payment is pending.
- Notification broadcast has high failure rate.

---

## 7. Backups

Backup:
- Database.
- Important uploaded assets.
- Configuration documentation.

Test restoration periodically.

---

## 8. Production Simulation

`ORDER_SIMULATION_ENABLED=false` in production.

Real order state must be controlled by authorized staff/agents.

---

## 9. Rollback

Every production release must have:
- Version.
- Migration plan.
- Rollback consideration.
- Health check.

Avoid irreversible database changes without a migration strategy.
