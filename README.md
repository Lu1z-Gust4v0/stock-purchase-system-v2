# Stock Purchase System V2

A scheduled stock purchase system built as a **Modular Monolith** following **Hexagonal Architecture (Ports & Adapters)**. Clients subscribe to a recurring monthly investment plan into a "Top Five" recommended basket of stocks. The system executes consolidated purchases on a master broker account and distributes assets proportionally to each client's individual child account.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?logo=apachekafka&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?logo=rabbitmq&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-UI-85EA2D?logo=swagger&logoColor=black)

---

## Table of Contents

- [Overview](#overview)
- [Domain Modules](#domain-modules)
- [Architecture](#architecture)
- [Scheduled Jobs](#scheduled-jobs)
- [Event Flow](#event-flow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)

---

## Overview

The system manages the full lifecycle of a recurring investment plan:

1. An admin registers a **Top Five basket** of 5 stocks with allocation percentages.
2. **Clients** subscribe with a monthly deposit amount (min R$ 100).
3. On the **5th, 15th, and 25th of each month** (shifted to Monday if the day falls on a weekend), the purchase engine consolidates all client deposits, fetches B3 closing prices (COTAHIST), calculates lot sizes, and places orders on the master account.
4. After purchase, assets are **distributed proportionally** to each client's graphical (child) account.
5. When the basket changes, all client portfolios are **rebalanced** automatically (sell removed tickers, buy new ones).
6. **Tax events** (regulatory withholding and monthly sales profit tax) are calculated and published to Kafka.

---

## Domain Modules

| Module            | Responsibility                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `customer`        | Client lifecycle: subscribe, disable, update monthly deposit, portfolio view                   |
| `basket`          | Top Five basket management: register, activate, history                                        |
| `quote`           | B3 COTAHIST file parsing and historical price storage                                          |
| `order`           | Buy order registration and lot-splitting (standard lot vs. fractional market)                  |
| `custody`         | Asset positions per graphical account; balance (currency) tracking                             |
| `purchase-engine` | Orchestrates the full purchase cycle: calculate → order → update custody → emit event          |
| `rebalancing`     | Two strategies: basket-change rebalancing (event-driven) and deviation rebalancing (scheduled) |
| `tax`             | Tax calculation and Kafka publishing: regulatory (0.005%) and sales profit tax (20%)           |

---

## Architecture

Each module follows strict Hexagonal Architecture layers:

```
domain/          → Plain TypeScript classes, no framework decorators
application/     → Use cases, ports (interfaces), DTOs
infrastructure/  → Prisma repos, Kafka/RabbitMQ adapters, schedulers, controllers
api/             → Public interface for cross-module synchronous calls
```

**Cross-module communication:**

- **Synchronous** — via `api/` bridge interfaces (e.g., `purchase-engine` reads the active basket via `BasketApiInterface`).
- **Asynchronous** — via RabbitMQ event bus: `BasketChangedEvent` triggers rebalancing; `PurchaseExecutedEvent` triggers regulatory tax publishing.
- **External messaging** — Kafka is used exclusively for publishing tax events to downstream consumers.

---

## Scheduled Jobs

| Job                         | Schedule (UTC) | Description                                                                                  |
| --------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `ExecutePurchaseJob`        | `0 3 * * 1-5`  | Runs on weekdays; executes the purchase cycle on the 5th, 15th, 25th (weekend → next Monday) |
| `RebalanceByDeviationJob`   | `0 3 * * 1-5`  | Daily deviation rebalancing for all active clients                                           |
| `CustomerTaxesPublisherJob` | `0 3 1 * *`    | 1st of each month: calculates and publishes prior-month sales tax for all active clients     |

---

## Event Flow

```
register-basket.use-case  ──► BasketChangedEvent (RabbitMQ)
                                        │
                              basket-changed.consumer (rebalancing)
                                        │
                              rebalance-by-basket-change.use-case

execute-purchase.use-case ──► PurchaseExecutedEvent (RabbitMQ)
                                        │
                              purchase-executed.consumer (purchase-engine)
                                        │
                              calculate-regulatory-tax → publish-tax → Kafka
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL (5432), Kafka (9092), Kafka UI (8080), and RabbitMQ (5672 / management UI 15672).

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work with docker-compose)
```

### 4. Run database migrations and seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start the application

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build && npm run start:prod
```

---

## Environment Variables

| Variable                  | Default                                                        | Description                    |
| ------------------------- | -------------------------------------------------------------- | ------------------------------ |
| `PORT`                    | `3000`                                                         | HTTP server port               |
| `DATABASE_URL`            | `postgresql://postgres:postgres@localhost:5432/stock_purchase` | Prisma connection string       |
| `KAFKA_BROKER`            | `localhost:9092`                                               | Kafka bootstrap server         |
| `KAFKA_CLIENT_ID`         | `stock-purchase`                                               | Kafka client identifier        |
| `KAFKA_CONSUMER_GROUP_ID` | `stock-purchase-group`                                         | Kafka consumer group           |
| `KAFKA_TAX_EVENTS_TOPIC`  | `tax-events`                                                   | Topic for tax event publishing |
| `RABBITMQ_URL`            | `amqp://guest:guest@localhost:5672`                            | RabbitMQ connection string     |

See `.env.example` for the full list.

---

## API Documentation

Swagger UI is available at `http://localhost:3000/api` after starting the application.

Main endpoints:

| Method   | Path                       | Description                           |
| -------- | -------------------------- | ------------------------------------- |
| `POST`   | `/customers`               | Subscribe a new client                |
| `PATCH`  | `/customers/:id/deposit`   | Update monthly deposit amount         |
| `DELETE` | `/customers/:id`           | Disable a client                      |
| `GET`    | `/customers/:id/portfolio` | Get client portfolio with performance |
| `POST`   | `/admin/basket`            | Register a new Top Five basket        |
| `GET`    | `/admin/basket/current`    | Get the active basket                 |
| `GET`    | `/admin/basket/history`    | List all historical baskets           |
| `POST`   | `/purchase-engine/execute` | Manually trigger a purchase cycle     |

---

## Project Structure

```
src/
├── main.ts                          # Bootstrap, Swagger setup
├── app.module.ts                    # Root module
├── config/
│   └── filters/                     # HTTP and Prisma exception filters
├── shared/
│   ├── kernel/                      # Entity, AggregateRoot, ValueObject base classes
│   ├── domain/                      # Money value object
│   ├── events/                      # DomainEvent interface + BasketChangedEvent, PurchaseExecutedEvent
│   ├── errors/                      # DomainException
│   └── infrastructure/
│       ├── prisma/                  # PrismaService, PrismaModule
│       ├── messaging/               # RabbitMQ event bus adapter
│       ├── events/                  # LoggingEventBus (dev)
│       └── logging/                 # nestjs-pino logger module
└── modules/
    ├── customer/                    # Client lifecycle
    ├── basket/                      # Top Five basket
    ├── quote/                       # B3 COTAHIST quotes
    ├── order/                       # Buy order registration
    ├── custody/                     # Asset positions & balances
    ├── purchase-engine/             # Purchase orchestration
    ├── rebalancing/                 # Portfolio rebalancing
    └── tax/                         # Tax calculation & Kafka publishing
```

### Database schema highlights

- `Client` — subscriber with `monthlyDeposit` and `active` flag
- `GraphicalAccount` — broker account, `AccountType.MASTER | CHILD`
- `Basket` / `BasketItem` — Top Five basket with ticker codes and allocation percentages
- `Quote` — B3 daily closing prices, unique per `(date, code)`
- `Order` — buy orders, `MarketType.SPOT | FRACTIONAL`
- `Custody` — asset position per `(graphicalAccountId, code)`
- `CustodyEvent` — audit log of PURCHASE / SALE / DISTRIBUTION events
- `Currency` — cash balance per account (BRL)
- `Distribution` — cash distribution records from master to child accounts
- `TaxEvent` — tax events with `type: SALE | REGULATORY` and `published` flag

---

## Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## Future Improvements

See [future-improvements.md](./future-improvements.md) for a prioritized list of planned enhancements covering resilience, test coverage, authentication, leftover share distribution, observability, and a frontend.
