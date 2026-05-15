import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import { CUSTODY_API } from '@/modules/custody/api/custody-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import { PurchaseExecutedEvent } from '@/shared/events/domain-events/purchase-executed.event';
import { DistributeSharesUseCase } from '../../application/use-cases/distribute-shares.use-case';

@Controller()
export class PurchaseExecutedConsumer {
  constructor(
    @Inject(CUSTOMER_API) private readonly customerApi: CustomerApiInterface,
    @Inject(CUSTODY_API) private readonly custodyApi: CustodyApiInterface,
    private readonly distributeShares: DistributeSharesUseCase,
  ) {}

  @EventPattern(PurchaseExecutedEvent.name)
  async handle(
    @Payload() payload: ReturnType<PurchaseExecutedEvent['toJSON']>,
  ): Promise<void> {
    const event = PurchaseExecutedEvent.fromJSON(payload);

    const [activeClients, masterAccount] = await Promise.all([
      this.customerApi.getActiveClients(),
      this.custodyApi.getMasterAccountCustody(),
    ]);

    for (const customer of activeClients) {
      await this.distributeShares.execute({
        customer: customer,
        masterAccount: masterAccount,
        purchaseTotalAmount: event.totalPurchase,
      });
    }
  }
}
