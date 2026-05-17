import { Controller, Inject, Logger, UseFilters } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { Channel, Message } from 'amqplib';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import { CUSTODY_API } from '@/modules/custody/api/custody-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import { PurchaseExecutedEvent } from '@/shared/events/domain-events/purchase-executed.event';
import { DistributeSharesUseCase } from '../../application/use-cases/distribute-shares.use-case';
import { RmqExceptionFilter } from '@/shared/infrastructure/messaging/rmq-exception.filter';

@Controller()
export class PurchaseExecutedConsumer {
  private readonly logger = new Logger(PurchaseExecutedConsumer.name);

  constructor(
    @Inject(CUSTOMER_API) private readonly customerApi: CustomerApiInterface,
    @Inject(CUSTODY_API) private readonly custodyApi: CustodyApiInterface,
    private readonly distributeShares: DistributeSharesUseCase,
  ) {}

  @EventPattern(PurchaseExecutedEvent.name)
  @UseFilters(new RmqExceptionFilter())
  async handle(
    @Payload() payload: ReturnType<PurchaseExecutedEvent['toJSON']>,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const event = PurchaseExecutedEvent.fromJSON(payload);
    this.logger.log(
      { totalPurchase: event.totalPurchase },
      'PurchaseExecutedEvent received',
    );

    const [activeClients, masterAccount] = await Promise.all([
      this.customerApi.getActiveClients(),
      this.custodyApi.getMasterAccountCustody(),
    ]);

    this.logger.log(
      { totalPurchase: event.totalPurchase, clientCount: activeClients.length },
      'Distributing shares to active clients',
    );

    for (const customer of activeClients) {
      await this.distributeShares.execute({
        customer: customer,
        masterAccount: masterAccount,
        purchaseTotalAmount: event.totalPurchase,
      });
      this.logger.debug(
        { totalPurchase: event.totalPurchase, accountId: customer.graphicalAccountId },
        'Shares distributed to customer',
      );
    }

    const channel = context.getChannelRef() as Channel;
    channel.ack(context.getMessage() as Message);
    this.logger.log(
      { totalPurchase: event.totalPurchase },
      'PurchaseExecutedEvent processed',
    );
  }
}
