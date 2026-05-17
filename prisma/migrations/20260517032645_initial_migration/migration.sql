-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('MASTER', 'CHILD');

-- CreateEnum
CREATE TYPE "MarketType" AS ENUM ('SPOT', 'FRACTIONAL');

-- CreateEnum
CREATE TYPE "CustodyEventType" AS ENUM ('PURCHASE', 'SALE', 'DISTRIBUTION');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('BRL');

-- CreateEnum
CREATE TYPE "TaxEventType" AS ENUM ('SALE', 'REGULATORY');

-- CreateTable
CREATE TABLE "baskets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "baskets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basket_items" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "basket_id" TEXT NOT NULL,

    CONSTRAINT "basket_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "opening_price" DECIMAL(10,2) NOT NULL,
    "closing_price" DECIMAL(10,2) NOT NULL,
    "max_price" DECIMAL(10,2) NOT NULL,
    "min_price" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "main_document_code" VARCHAR(50) NOT NULL,
    "monthly_deposit" DECIMAL(18,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graphical_accounts" (
    "id" TEXT NOT NULL,
    "account" VARCHAR(255) NOT NULL,
    "type" "AccountType" NOT NULL,
    "client_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "graphical_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitary_price" DECIMAL(10,2) NOT NULL,
    "graphical_account_id" TEXT NOT NULL,
    "market_type" "MarketType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custodies" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "average_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "graphical_account_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custodies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custody_events" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "unitary_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "CustodyEventType" NOT NULL,
    "profit" DECIMAL(18,2) NOT NULL,
    "graphical_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custody_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "code" "CurrencyCode" NOT NULL,
    "graphical_account_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "code" "CurrencyCode" NOT NULL,
    "graphical_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_events" (
    "id" TEXT NOT NULL,
    "type" "TaxEventType" NOT NULL,
    "base_amount" DECIMAL(18,2) NOT NULL,
    "tax_amount" DECIMAL(18,2) NOT NULL,
    "published" BOOLEAN NOT NULL,
    "graphical_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotes_date_code_key" ON "quotes"("date", "code");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_main_document_code_key" ON "clients"("main_document_code");

-- CreateIndex
CREATE UNIQUE INDEX "graphical_accounts_client_id_key" ON "graphical_accounts"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "custodies_graphical_account_id_code_key" ON "custodies"("graphical_account_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_graphical_account_id_key" ON "currencies"("graphical_account_id");

-- AddForeignKey
ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_basket_id_fkey" FOREIGN KEY ("basket_id") REFERENCES "baskets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graphical_accounts" ADD CONSTRAINT "graphical_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_graphical_account_id_fkey" FOREIGN KEY ("graphical_account_id") REFERENCES "graphical_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custodies" ADD CONSTRAINT "custodies_graphical_account_id_fkey" FOREIGN KEY ("graphical_account_id") REFERENCES "graphical_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custody_events" ADD CONSTRAINT "custody_events_graphical_account_id_fkey" FOREIGN KEY ("graphical_account_id") REFERENCES "graphical_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_graphical_account_id_fkey" FOREIGN KEY ("graphical_account_id") REFERENCES "graphical_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_graphical_account_id_fkey" FOREIGN KEY ("graphical_account_id") REFERENCES "graphical_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_events" ADD CONSTRAINT "tax_events_graphical_account_id_fkey" FOREIGN KEY ("graphical_account_id") REFERENCES "graphical_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
