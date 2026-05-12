import { Injectable } from '@nestjs/common';
import type { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import type { EventBusPort } from '@/shared/events/event-bus.interface';
import { Money } from '@/shared/domain/money.vo';
import { DomainError } from '@/shared/errors/domain.exception';
import { CustodyEventType } from '@/modules/custody/domain/custody-event.entity';
import { PurchaseExecutedEvent } from '@/shared/events/domain-events/purchase-executed.event';
import { CalculatePurchaseUseCase } from './calculate-purchase.use-case';

@Injectable()
export class ExecutePurchaseUseCase {
  constructor(
    private readonly basketApi: BasketApiInterface,
    private readonly custodyApi: CustodyApiInterface,
    private readonly orderApi: OrderApiInterface,
    private readonly eventBus: EventBusPort,
    private readonly calculatePurchase: CalculatePurchaseUseCase,
  ) {}

  async execute(referenceDate: Date): Promise<void> {
    const basket = await this.basketApi.getActiveBasket();

    if (!basket) {
      throw new DomainError('No active basket found');
    }

    const masterCustody = await this.custodyApi.getMasterAccountCustody();

    const { totalAmount, orders, leftovers } =
      await this.calculatePurchase.execute(basket, referenceDate);

    await this.orderApi.registerOrder({
      brokerageAccountId: masterCustody.graphicalAccountId,
      items: orders,
    });

    await this.custodyApi.updateAccountCustody({
      graphicalAccountId: masterCustody.graphicalAccountId,
      changes: orders.map((order) => ({
        ticker: order.ticker,
        quantity: order.quantity,
        type: CustodyEventType.PURCHASE,
        profit: Money.zero(),
        unitaryPrice: order.unitaryPrice,
      })),
      newBalance: leftovers,
    });

    this.eventBus.publish(
      new PurchaseExecutedEvent(masterCustody.graphicalAccountId, totalAmount),
    );
  }
}
