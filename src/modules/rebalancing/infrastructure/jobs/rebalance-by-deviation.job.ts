import { Controller, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import { BASKET_API } from '@/modules/basket/api/basket-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import type { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import { RebalanceByDeviationUseCase } from '../../application/use-cases/rebalance-by-deviation.use-case';

@Controller()
export class RebalanceByDeviationJob {
  private readonly logger = new Logger(RebalanceByDeviationJob.name);

  constructor(
    @Inject(CUSTOMER_API) private readonly customerApi: CustomerApiInterface,
    @Inject(BASKET_API) private readonly basketApi: BasketApiInterface,
    private readonly rebalanceByDeviation: RebalanceByDeviationUseCase,
  ) {}

  @Cron('0 3 * * 1-5', { timeZone: 'UTC' })
  async run(): Promise<void> {
    const [activeClients, basket] = await Promise.all([
      this.customerApi.getActiveClients(),
      this.basketApi.getActiveBasket(),
    ]);

    if (!basket) {
      this.logger.warn('Skipping rebalancing — no active basket found');
      return;
    }

    this.logger.log(
      `Starting deviation rebalancing for ${activeClients.length} customers`,
    );

    for (const customer of activeClients) {
      this.logger.log(`Rebalancing customer ${customer.id}`);
      await this.rebalanceByDeviation.execute({
        customerAccountId: customer.graphicalAccountId,
        basket,
      });
    }

    this.logger.log('Deviation rebalancing completed');
  }
}
