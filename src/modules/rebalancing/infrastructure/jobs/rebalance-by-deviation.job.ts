import { Controller, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import { BASKET_API } from '@/modules/basket/api/basket-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import type { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import { RebalanceByDeviationUseCase } from '../../application/use-cases/rebalance-by-deviation.use-case';

@Controller()
export class RebalanceByDeviationJob {
  constructor(
    @Inject(CUSTOMER_API) private readonly customerApi: CustomerApiInterface,
    @Inject(BASKET_API) private readonly basketApi: BasketApiInterface,
    private readonly rebalanceByDeviation: RebalanceByDeviationUseCase,
  ) {}

  @Cron('0 3 * * 1-5')
  async run(): Promise<void> {
    const [activeClients, basket] = await Promise.all([
      this.customerApi.getActiveClients(),
      this.basketApi.getActiveBasket(),
    ]);

    if (!basket) return;

    for (const customer of activeClients) {
      await this.rebalanceByDeviation.execute({
        customerAccountId: customer.graphicalAccountId,
        basket,
      });
    }
  }
}
