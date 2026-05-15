import { Module } from '@nestjs/common';
import { BasketModule } from '@/modules/basket/basket.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { CustodyModule } from '@/modules/custody/custody.module';
import { QuoteModule } from '@/modules/quote/quote.module';
import { OrderModule } from '@/modules/order/order.module';
import { TaxModule } from '@/modules/tax/tax.module';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';
import { EventBusModule } from '@/shared/infrastructure/events/event-bus.module';
import { BASKET_API } from '@/modules/basket/api/basket-api.interface';
import { CUSTODY_API } from '@/modules/custody/api/custody-api.interface';
import { QUOTES_API } from '@/modules/quote/api/quotes-api.interface';
import { ORDER_API } from '@/modules/order/api/order-api.interface';
import { TAX_API } from '@/modules/tax/api/tax-api.interface';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import { EVENT_BUS_PORT } from '@/shared/events/event-bus.interface';
import type { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import type { TaxApiInterface } from '@/modules/tax/api/tax-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import type { EventBusPort } from '@/shared/events/event-bus.interface';
import type { DistributionRepositoryPort } from './application/ports/distribution-repository.port';
import { DISTRIBUTION_REPOSITORY_PORT } from './application/ports/distribution-repository.port';
import { CalculatePurchaseUseCase } from './application/use-cases/calculate-purchase.use-case';
import { ExecutePurchaseUseCase } from './application/use-cases/execute-purchase.use-case';
import { DistributeSharesUseCase } from './application/use-cases/distribute-shares.use-case';
import { DistributionRepository } from './infrastructure/persistence/prisma/distribution.repository';
import { PurchaseEngineController } from './infrastructure/web/purchase-engine.controller';
import { PurchaseExecutedConsumer } from './infrastructure/messaging/purchase-executed.consumer';
import { ExecutePurchaseJob } from './infrastructure/jobs/execute-purchase.job';

@Module({
  imports: [
    BasketModule,
    CustomerModule,
    CustodyModule,
    QuoteModule,
    OrderModule,
    TaxModule,
    PrismaModule,
    EventBusModule,
  ],
  controllers: [
    PurchaseEngineController,
    PurchaseExecutedConsumer,
    ExecutePurchaseJob,
  ],
  providers: [
    {
      provide: DISTRIBUTION_REPOSITORY_PORT,
      useClass: DistributionRepository,
    },
    {
      provide: CalculatePurchaseUseCase,
      useFactory: (
        customerApi: CustomerApiInterface,
        quotesApi: QuotesApiInterface,
        orderApi: OrderApiInterface,
      ) => new CalculatePurchaseUseCase(customerApi, quotesApi, orderApi),
      inject: [CUSTOMER_API, QUOTES_API, ORDER_API],
    },
    {
      provide: ExecutePurchaseUseCase,
      useFactory: (
        basketApi: BasketApiInterface,
        custodyApi: CustodyApiInterface,
        orderApi: OrderApiInterface,
        eventBus: EventBusPort,
        calculatePurchase: CalculatePurchaseUseCase,
      ) =>
        new ExecutePurchaseUseCase(
          basketApi,
          custodyApi,
          orderApi,
          eventBus,
          calculatePurchase,
        ),
      inject: [
        BASKET_API,
        CUSTODY_API,
        ORDER_API,
        EVENT_BUS_PORT,
        CalculatePurchaseUseCase,
      ],
    },
    {
      provide: DistributeSharesUseCase,
      useFactory: (
        custodyApi: CustodyApiInterface,
        taxApi: TaxApiInterface,
        distributionRepo: DistributionRepositoryPort,
      ) => new DistributeSharesUseCase(custodyApi, taxApi, distributionRepo),
      inject: [CUSTODY_API, TAX_API, DISTRIBUTION_REPOSITORY_PORT],
    },
  ],
})
export class PurchaseEngineModule {}
