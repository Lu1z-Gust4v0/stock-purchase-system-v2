# Future Improvements

Planned enhancements sorted by priority. Items at the top address correctness and safety in a financial context; items further down improve the user experience and operational visibility.

---

## 1. Resilience

> A financial system that can leave data in a partial state is worse than one that fails completely. These changes are the foundation everything else depends on.

- **Add database transactions** — The purchase and distribution flows touch custody, orders, and balances across multiple writes with no transactional boundary. A failure mid-cycle produces silently inconsistent state that is hard to detect and hard to roll back.

- **Add idempotency to critical operations** — The purchase job and tax publisher can be re-triggered by a restart or a scheduler overlap. Without idempotency keys, re-runs produce duplicate orders and double-counted tax obligations.

- **Make failed jobs restartable** — There is no checkpoint mechanism today. If the purchase job fails while distributing to client accounts, the only recovery option is reprocessing the entire cycle, risking double execution for already-processed clients.

---

## 2. Test Coverage

> Correctness cannot be claimed without tests. Increasing coverage also makes all subsequent improvements safer to ship.

- **Increase unit test coverage across all modules** — Most domain services and use cases are untested; the purchase calculator and distribution calculator are the only well-covered areas. Rebalancing logic, tax calculation, and custody updates are the highest-risk gaps.

- **Add integration tests for scheduled jobs** — The cron jobs are the system's core behavior but are only validated manually today. Tests should cover eligible-day detection, end-to-end custody updates, and event publishing side-effects.

---

## 3. Authentication and Authorization

> All endpoints are currently public. This must be addressed before any real deployment.

- **Add JWT-based authentication** — Admin operations such as registering a basket or manually triggering a purchase must be restricted to authenticated users.

- **Add role-based access control** — Separate admin routes from client-facing routes so that a logged-in customer cannot access another customer's data or trigger system-wide operations.

---

## 4. Leftover Share Distribution

> Each purchase cycle leaves fractional residual shares in the master account. Over many cycles this creates a growing distortion between what clients paid for and what they actually hold.

- **Sell master account residual shares and redistribute cash to clients** — After each purchase cycle, any shares that could not be allocated to a client account should be liquidated and the proceeds credited back to clients proportionally. This closes the gap between the theoretical and actual portfolio composition.

---

## 5. Observability

> Scheduled jobs running silently in production make incidents hard to detect and harder to diagnose. Observability turns invisible failures into actionable alerts.

- **Add structured metrics for scheduled jobs** — Track purchase execution duration, number of clients processed, total amount invested, and per-run failure rates so that anomalies surface in dashboards rather than support tickets.

- **Add distributed tracing** — Correlate a single purchase cycle across the purchase-engine, custody, order, and tax modules using a shared trace ID to make debugging cross-module failures tractable.

- **Add alerting for job failures and anomalies** — A failed purchase job or a tax publishing error should trigger an immediate alert rather than being discovered through manual log inspection.

---

## 6. Frontend

> The system is fully functional as an API today. A frontend makes it accessible to clients and reduces operational overhead for admins.

- **Portfolio page with asset breakdown and price evolution** — Clients currently have no interface to view their positions. A page showing holdings, average prices, current market value, and profit/loss over time is the minimum viable client-facing feature.

- **Admin dashboard for basket and purchase management** — Allow admins to register baskets, review purchase history, and monitor job status without using the raw API or Swagger UI.
