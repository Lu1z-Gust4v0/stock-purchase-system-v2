import { Module } from '@nestjs/common';
import { BasketModule } from '@/modules/basket/basket.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { CustodyModule } from '@/modules/custody/custody.module';
import { QuoteModule } from '@/modules/quote/quote.module';
import { OrderModule } from '@/modules/order/order.module';
import { EventBusModule } from '@/shared/infrastructure/events/event-bus.module';
import { BASKET_API } from '@/modules/basket/api/basket-api.interface';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import { CUSTODY_API } from '@/modules/custody/api/custody-api.interface';
import { QUOTES_API } from '@/modules/quote/api/quotes-api.interface';
import { ORDER_API } from '@/modules/order/api/order-api.interface';
import { EVENT_BUS_PORT } from '@/shared/events/event-bus.interface';
import { type BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import { type CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import { type CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import { type QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import { type OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { type EventBusPort } from '@/shared/events/event-bus.interface';
import { CalculatePurchaseUseCase } from './application/use-cases/calculate-purchase.use-case';
import { ExecutePurchaseUseCase } from './application/use-cases/execute-purchase.use-case';
import { PurchaseEngineController } from './infrastructure/web/purchase-engine.controller';

@Module({
  imports: [
    BasketModule,
    CustomerModule,
    CustodyModule,
    QuoteModule,
    OrderModule,
    EventBusModule,
  ],
  controllers: [PurchaseEngineController],
  providers: [
    {
      provide: CalculatePurchaseUseCase,
      useFactory: (
        customerApi: CustomerApiInterface,
        custodyApi: CustodyApiInterface,
        quotesApi: QuotesApiInterface,
      ) => new CalculatePurchaseUseCase(customerApi, custodyApi, quotesApi),
      inject: [CUSTOMER_API, CUSTODY_API, QUOTES_API],
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
      inject: [BASKET_API, CUSTODY_API, ORDER_API, EVENT_BUS_PORT, CalculatePurchaseUseCase],
    },
  ],
})
export class PurchaseEngineModule {}
