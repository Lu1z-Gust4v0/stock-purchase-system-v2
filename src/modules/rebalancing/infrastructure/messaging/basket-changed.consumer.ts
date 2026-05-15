import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BASKET_API } from '@/modules/basket/api/basket-api.interface';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import type { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import { BasketChangedEvent } from '@/shared/events/domain-events/basket-changed.event';
import { DomainError } from '@/shared/errors/domain.exception';
import { RebalanceByBasketChangeUseCase } from '../../application/use-cases/rebalance-by-basket-change.use-case';

@Controller()
export class BasketChangedConsumer {
  constructor(
    @Inject(BASKET_API) private readonly basketApi: BasketApiInterface,
    @Inject(CUSTOMER_API) private readonly customerApi: CustomerApiInterface,
    private readonly rebalanceByBasketChange: RebalanceByBasketChangeUseCase,
  ) {}

  @EventPattern(BasketChangedEvent.name)
  async handle(
    @Payload() payload: ReturnType<BasketChangedEvent['toJSON']>,
  ): Promise<void> {
    const event = BasketChangedEvent.fromJSON(payload);

    const newBasket = await this.basketApi.getActiveBasket();

    if (!newBasket) {
      throw new DomainError(
        `No active basket found for BasketChangedEvent ${event.basketId}`,
      );
    }

    const activeClients = await this.customerApi.getActiveClients();

    for (const customer of activeClients) {
      await this.rebalanceByBasketChange.execute({
        customerAccountId: customer.graphicalAccountId,
        newBasket: newBasket,
      });
    }
  }
}
