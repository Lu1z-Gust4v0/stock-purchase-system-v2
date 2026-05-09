# Architecture: Scheduled Stock Purchase System

## Overview

A **Scheduled Stock Purchase System** for Itaú Corretora built as a **Modular Monolith** following **Hexagonal Architecture (Ports & Adapters)**. Clients subscribe to a recurring monthly investment plan into a "Top Five" recommended basket of 5 stocks. The system executes consolidated purchases on a master broker account and distributes assets proportionally to each client's individual child account.

**Stack:** NestJS (TypeScript) · PostgreSQL · Apache Kafka · REST API (Swagger)

---

## Domain Entities

| Entity                   | Role                                                                         | Module            |
| ------------------------ | ---------------------------------------------------------------------------- | ----------------- |
| **Customer**             | Aggregate root — personal data, monthly amount, active status                | `customers`       |
| **BrokerageAccount**     | Child account created on subscription; links customer to their custody       | `customers`       |
| **MasterAccount**        | Single broker master account; consolidates purchases before distribution     | `accounts`        |
| **RecommendationBasket** | Aggregate root — 5 tickers with allocation percentages; one active at a time | `basket`          |
| **BasketItem**           | Value object — ticker + allocation percentage                                | `basket`          |
| **HistoricalQuote**      | B3 COTAHIST quote (date, ticker, closing price, market type)                 | `quotes`          |
| **PurchaseOrder**        | Consolidated buy order executed on the master account                        | `purchase-engine` |
| **Distribution**         | Allocation record from master account to each child custody                  | `purchase-engine` |
| **ChildCustody**         | Client asset position: ticker, quantity, average price                       | `custody`         |
| **MasterCustody**        | Residual assets remaining in master after distribution                       | `custody`         |
| **RebalancingLog**       | Audit log of rebalancing operations                                          | `rebalancing`     |
| **TaxEvent**             | Kafka message payload for withholding tax and sale tax events                | `tax`             |

---

## Folder Structure

```
/
├── quotes/                                # B3 COTAHIST TXT files (COTAHIST_D*.TXT)
├── docker-compose.yml                     # Kafka + PostgreSQL + Zookeeper
├── README.md
├── architecture.md
├── package.json
├── tsconfig.json
├── nest-cli.json
│
├── src/
│   ├── main.ts                            # Bootstrap, Swagger setup
│   ├── app.module.ts                      # Root module — imports all feature modules
│   │
│   ├── shared/                            # Shared kernel — zero business logic
│   │   ├── kernel/
│   │   │   ├── entity.ts
│   │   │   ├── aggregate-root.ts
│   │   │   └── value-object.ts
│   │   ├── events/
│   │   │   ├── domain-event.interface.ts
│   │   │   ├── event-bus.interface.ts
│   │   │   └── domain-events/
│   │   │       ├── basket-changed.event.ts        # triggers rebalancing
│   │   │       └── purchase-executed.event.ts     # triggers tax publishing
│   │   └── exceptions/
│   │       └── domain.exception.ts
│   │
│   ├── customers/                         # Module: customer lifecycle
│   │   ├── domain/
│   │   │   ├── customer.entity.ts         # Aggregate root
│   │   │   ├── brokerage-account.entity.ts
│   │   │   └── value-objects/
│   │   │       ├── tax-id.vo.ts           # CPF validation
│   │   │       ├── email.vo.ts
│   │   │       └── monthly-amount.vo.ts   # min R$ 100 rule
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── subscribe-customer.use-case.ts
│   │   │   │   ├── unsubscribe-customer.use-case.ts
│   │   │   │   └── update-monthly-amount.use-case.ts
│   │   │   ├── ports/
│   │   │   │   └── customer-repository.port.ts
│   │   │   └── dtos/
│   │   │       ├── subscribe-customer-request.dto.ts
│   │   │       └── customer-response.dto.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── prisma/
│   │   │   │   │   └── customer.schema.ts         # Prisma @Entity (only here)
│   │   │   │   ├── customer.repository.ts         # implements CustomerRepositoryPort
│   │   │   │   └── mappers/
│   │   │   │       └── customer.mapper.ts
│   │   │   └── web/
│   │   │       └── customers.controller.ts
│   │   ├── api/
│   │   │   └── customers-api.interface.ts         # public face for cross-module calls
│   │   └── customers.module.ts
│   │
│   ├── basket/                            # Module: Top Five basket management
│   │   ├── domain/
│   │   │   ├── recommendation-basket.entity.ts    # Aggregate root
│   │   │   └── basket-item.vo.ts                  # Value object: ticker + percentage
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── register-basket.use-case.ts    # publishes BasketChangedEvent
│   │   │   │   ├── get-current-basket.use-case.ts
│   │   │   │   └── list-basket-history.use-case.ts
│   │   │   ├── ports/
│   │   │   │   └── basket-repository.port.ts
│   │   │   └── dtos/
│   │   │       ├── register-basket-request.dto.ts
│   │   │       └── basket-response.dto.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── prisma/
│   │   │   │   │   └── basket.schema.ts
│   │   │   │   ├── basket.repository.ts
│   │   │   │   └── mappers/
│   │   │   │       └── basket.mapper.ts
│   │   │   └── web/
│   │   │       └── admin-basket.controller.ts
│   │   ├── api/
│   │   │   └── basket-api.interface.ts
│   │   └── basket.module.ts
│   │
│   ├── quotes/                            # Module: B3 COTAHIST parsing & quote storage
│   │   ├── domain/
│   │   │   └── historical-quote.entity.ts
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   └── import-quotes.use-case.ts
│   │   │   ├── ports/
│   │   │   │   ├── quote-repository.port.ts
│   │   │   │   └── cotahist-parser.port.ts        # port — decouples parsing strategy
│   │   │   └── dtos/
│   │   │       └── quote.dto.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── prisma/
│   │   │   │   │   └── quote.schema.ts
│   │   │   │   ├── quote.repository.ts
│   │   │   │   └── mappers/
│   │   │   │       └── quote.mapper.ts
│   │   │   └── parsers/
│   │   │       └── cotahist.parser.ts             # adapter — fixed-width TXT parsing
│   │   ├── api/
│   │   │   └── quotes-api.interface.ts            # exposes getClosingPrice(ticker, date)
│   │   └── quotes.module.ts
│   │
│   ├── custody/                           # Module: asset custody positions
│   │   ├── domain/
│   │   │   ├── child-custody.entity.ts            # Aggregate root — per client position
│   │   │   ├── master-custody.entity.ts           # Aggregate root — broker residuals
│   │   │   └── asset-position.entity.ts           # ticker + quantity + average price
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── get-portfolio.use-case.ts
│   │   │   │   └── get-performance.use-case.ts
│   │   │   ├── ports/
│   │   │   │   ├── child-custody-repository.port.ts
│   │   │   │   └── master-custody-repository.port.ts
│   │   │   └── dtos/
│   │   │       ├── portfolio-response.dto.ts
│   │   │       └── performance-response.dto.ts
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       ├── prisma/
│   │   │       │   └── custody.schema.ts
│   │   │       ├── child-custody.repository.ts
│   │   │       ├── master-custody.repository.ts
│   │   │       └── mappers/
│   │   │           └── custody.mapper.ts
│   │   ├── api/
│   │   │   └── custody-api.interface.ts           # getMasterBalance, updateChildCustody, etc.
│   │   └── custody.module.ts
│   │
│   ├── purchase-engine/                   # Module: scheduled purchase engine (core)
│   │   ├── domain/
│   │   │   ├── purchase-order.entity.ts           # Aggregate root
│   │   │   ├── distribution.entity.ts
│   │   │   └── services/
│   │   │       ├── purchase-calculator.service.ts # standard-lot vs. fractional split
│   │   │       └── distribution.service.ts        # proportional distribution + residuals
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   └── execute-purchase.use-case.ts   # orchestrates the full 7-step flow
│   │   │   ├── ports/
│   │   │   │   ├── purchase-order-repository.port.ts
│   │   │   │   └── distribution-repository.port.ts
│   │   │   └── dtos/
│   │   │       ├── execute-purchase-request.dto.ts
│   │   │       └── purchase-result-response.dto.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── prisma/
│   │   │   │   │   └── purchase-order.schema.ts
│   │   │   │   ├── purchase-order.repository.ts
│   │   │   │   ├── distribution.repository.ts
│   │   │   │   └── mappers/
│   │   │   │       └── purchase-order.mapper.ts
│   │   │   ├── schedulers/
│   │   │   │   └── purchase.scheduler.ts          # @nestjs/schedule — cron days 5/15/25
│   │   │   └── web/
│   │   │       └── purchase-engine.controller.ts  # manual trigger endpoint for testing
│   │   ├── api/
│   │   │   └── purchase-engine-api.interface.ts
│   │   └── purchase-engine.module.ts
│   │
│   ├── rebalancing/                       # Module: rebalancing engine
│   │   ├── domain/
│   │   │   ├── rebalancing-log.entity.ts
│   │   │   └── services/
│   │   │       └── rebalancing.service.ts         # sell removed, buy new, adjust %
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── rebalance-by-basket-change.use-case.ts
│   │   │   │   └── rebalance-by-deviation.use-case.ts
│   │   │   ├── ports/
│   │   │   │   └── rebalancing-repository.port.ts
│   │   │   └── event-handlers/
│   │   │       └── basket-changed.handler.ts      # subscribes to BasketChangedEvent
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       ├── prisma/
│   │   │       │   └── rebalancing-log.schema.ts
│   │   │       └── rebalancing.repository.ts
│   │   └── rebalancing.module.ts
│   │
│   └── tax/                               # Module: IR tax calculation & Kafka publishing
│       ├── domain/
│       │   └── services/
│       │       └── tax-calculator.service.ts      # withholding (0.005%) + sale tax (20%)
│       ├── application/
│       │   ├── use-cases/
│       │   │   └── publish-tax-event.use-case.ts
│       │   ├── ports/
│       │   │   └── tax-event-publisher.port.ts    # port — decouples Kafka dependency
│       │   ├── dtos/
│       │   │   ├── withholding-tax-event.dto.ts
│       │   │   └── sale-tax-event.dto.ts
│       │   └── event-handlers/
│       │       └── purchase-executed.handler.ts   # subscribes to PurchaseExecutedEvent
│       ├── infrastructure/
│       │   └── messaging/
│       │       └── kafka-tax-event.publisher.ts   # adapter — implements TaxEventPublisherPort
│       └── tax.module.ts
│
└── test/
    ├── unit/
    │   ├── customers/
    │   ├── basket/
    │   ├── purchase-engine/
    │   │   ├── purchase-calculator.service.spec.ts
    │   │   └── distribution.service.spec.ts
    │   ├── custody/
    │   │   └── asset-position.spec.ts
    │   ├── rebalancing/
    │   └── tax/
    │       └── tax-calculator.service.spec.ts
    └── integration/
        ├── purchase-engine/
        └── kafka/
```

---

## Hexagonal Layer Rules

Each module strictly enforces this import hierarchy — no exceptions:

| Layer              | Path              | Allowed imports                        | Strict prohibitions                                                 |
| ------------------ | ----------------- | -------------------------------------- | ------------------------------------------------------------------- |
| **Domain**         | `domain/`         | `shared/kernel` only                   | No NestJS, No Prisma, No application layer, No infrastructure       |
| **Application**    | `application/`    | `domain/`, `shared/`                   | No `infrastructure/`, no framework decorators                       |
| **Infrastructure** | `infrastructure/` | `application/`, `domain/`, `shared/`   | The only layer allowed to import Prisma, KafkaJS, NestJS decorators |
| **API**            | `api/`            | `application/use-cases`, `shared/dtos` | No `infrastructure/`, no `domain/` entities directly                |

Domain entities are **plain TypeScript classes** — no `@Entity`, `@Column`, or `@Injectable` decorators.
Prisma schemas live exclusively in `infrastructure/persistence/prisma/`.

---

## Cross-Module Communication

### Synchronous (via `api/` bridges)

When module A needs data from module B, it calls `B.api` — a thin interface backed by a use case. No direct database cross-joins between modules.

Example: `purchase-engine` reads the active basket via `BasketApiInterface.getActiveBasket()`.

### Asynchronous (via Domain Events)

Side effects between modules use `EventEmitter2` as an in-process event bus:

```
register-basket.use-case  →  publishes BasketChangedEvent
                                         ↓
                              basket-changed.handler (rebalancing module)
                                         ↓
                              rebalance-by-basket-change.use-case

execute-purchase.use-case →  publishes PurchaseExecutedEvent
                                         ↓
                              purchase-executed.handler (tax module)
                                         ↓
                              publish-tax-event.use-case → Kafka
```

### DI Token Pattern

Each port exports a Symbol token for NestJS injection:

```typescript
// customer-repository.port.ts
export const CUSTOMER_REPOSITORY_PORT = Symbol('CUSTOMER_REPOSITORY_PORT');
export interface CustomerRepositoryPort { ... }
```

---

## Key Architectural Decisions

| Decision                                  | Rationale                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Modular Monolith                          | Single deployable; module boundaries enable future extraction if needed                                 |
| Hexagonal per module                      | Domain and Application layers stay framework-free and independently testable                            |
| Symbol-based DI tokens                    | NestJS requires tokens for interface-based injection — enforces decoupling                              |
| Prisma schemas isolated to infrastructure | Prevents ORM decorators from leaking into domain                                                        |
| `CotahistParserPort` as a Port            | Fixed-width TXT parsing is I/O; domain only needs `getClosingPrice(ticker): number`                     |
| Domain Events over direct calls           | `BasketChangedEvent` and `PurchaseExecutedEvent` decouple basket → rebalancing and purchase → tax flows |
| `AssetPosition.averagePrice`              | Maintained per (customerId, ticker); recalculated only on buys, never on sells                          |
| Separate `MasterCustody` entity           | Broker residuals are a first-class concept that feeds back into the next purchase cycle                 |
| PostgreSQL over MySQL                     | Superior `NUMERIC` precision for financial values; native UUID; full SQL compliance                     |
| `@nestjs/schedule` in infrastructure      | Scheduler is an adapter; business rules for day-5/15/25 + business-day shift live in domain             |
