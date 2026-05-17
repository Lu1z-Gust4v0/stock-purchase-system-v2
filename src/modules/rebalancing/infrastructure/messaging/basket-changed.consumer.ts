import { Controller, Inject, Logger, UseFilters } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { Channel, Message } from 'amqplib';
import { BASKET_API } from '@/modules/basket/api/basket-api.interface';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import type { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import { BasketChangedEvent } from '@/shared/events/domain-events/basket-changed.event';
import { DomainError } from '@/shared/errors/domain.exception';
import { RebalanceByBasketChangeUseCase } from '../../application/use-cases/rebalance-by-basket-change.use-case';
import { RmqExceptionFilter } from '@/shared/infrastructure/messaging/rmq-exception.filter';

@Controller()
export class BasketChangedConsumer {
  private readonly logger = new Logger(BasketChangedConsumer.name);

  constructor(
    @Inject(BASKET_API) private readonly basketApi: BasketApiInterface,
    @Inject(CUSTOMER_API) private readonly customerApi: CustomerApiInterface,
    private readonly rebalanceByBasketChange: RebalanceByBasketChangeUseCase,
  ) {}

  @EventPattern(BasketChangedEvent.name)
  @UseFilters(new RmqExceptionFilter())
  async handle(
    @Payload() payload: ReturnType<BasketChangedEvent['toJSON']>,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const event = BasketChangedEvent.fromJSON(payload);
    this.logger.log(
      { basketId: event.basketId },
      'BasketChangedEvent received',
    );

    const newBasket = await this.basketApi.getActiveBasket();

    if (!newBasket) {
      this.logger.warn(
        { basketId: event.basketId },
        'No active basket found, rejecting event',
      );
      throw new DomainError(
        `No active basket found for BasketChangedEvent ${event.basketId}`,
      );
    }

    const activeClients = await this.customerApi.getActiveClients();
    this.logger.log(
      { basketId: event.basketId, clientCount: activeClients.length },
      'Rebalancing active clients',
    );

    for (const customer of activeClients) {
      await this.rebalanceByBasketChange.execute({
        customerAccountId: customer.graphicalAccountId,
        newBasket: newBasket,
      });
      this.logger.debug(
        { basketId: event.basketId, accountId: customer.graphicalAccountId },
        'Customer rebalanced',
      );
    }

    const channel = context.getChannelRef() as Channel;
    channel.ack(context.getMessage() as Message);
    this.logger.log(
      { basketId: event.basketId },
      'BasketChangedEvent processed',
    );
  }
}
