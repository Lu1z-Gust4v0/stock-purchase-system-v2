import { Module } from '@nestjs/common';
import { BasketModule } from '@/modules/basket/basket.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { CustodyModule } from '@/modules/custody/custody.module';
import { QuoteModule } from '@/modules/quote/quote.module';
import { OrderModule } from '@/modules/order/order.module';
import { CUSTODY_API } from '@/modules/custody/api/custody-api.interface';
import { QUOTES_API } from '@/modules/quote/api/quotes-api.interface';
import { ORDER_API } from '@/modules/order/api/order-api.interface';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { ByBasketChangeCalculator } from './domain/services/by-basket-change-calculator.service';
import { ByDeviationCalculator } from './domain/services/by-deviation-calculator.service';
import { RebalanceByBasketChangeUseCase } from './application/use-cases/rebalance-by-basket-change.use-case';
import { RebalanceByDeviationUseCase } from './application/use-cases/rebalance-by-deviation.use-case';
import { BasketChangedConsumer } from './infrastructure/messaging/basket-changed.consumer';
import { RebalanceByDeviationJob } from './infrastructure/jobs/rebalance-by-deviation.job';

@Module({
  imports: [
    BasketModule,
    CustomerModule,
    CustodyModule,
    QuoteModule,
    OrderModule,
  ],
  controllers: [BasketChangedConsumer, RebalanceByDeviationJob],
  providers: [
    {
      provide: ByBasketChangeCalculator,
      useFactory: (
        quotesApi: QuotesApiInterface,
        orderApi: OrderApiInterface,
      ) => new ByBasketChangeCalculator(quotesApi, orderApi),
      inject: [QUOTES_API, ORDER_API],
    },
    {
      provide: ByDeviationCalculator,
      useFactory: (
        quotesApi: QuotesApiInterface,
        orderApi: OrderApiInterface,
      ) => new ByDeviationCalculator(quotesApi, orderApi),
      inject: [QUOTES_API, ORDER_API],
    },
    {
      provide: RebalanceByBasketChangeUseCase,
      useFactory: (
        calculator: ByBasketChangeCalculator,
        custodyApi: CustodyApiInterface,
        orderApi: OrderApiInterface,
      ) => new RebalanceByBasketChangeUseCase(calculator, custodyApi, orderApi),
      inject: [ByBasketChangeCalculator, CUSTODY_API, ORDER_API],
    },
    {
      provide: RebalanceByDeviationUseCase,
      useFactory: (
        calculator: ByDeviationCalculator,
        custodyApi: CustodyApiInterface,
        orderApi: OrderApiInterface,
      ) => new RebalanceByDeviationUseCase(calculator, custodyApi, orderApi),
      inject: [ByDeviationCalculator, CUSTODY_API, ORDER_API],
    },
  ],
})
export class RebalancingModule {}
