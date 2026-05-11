import { Injectable } from '@nestjs/common';
import type { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import type { EventBusPort } from '@/shared/events/event-bus.interface';
import { Money } from '@/shared/domain/money.vo';
import { DomainError } from '@/shared/errors/domain.exception';
import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';
import { PurchaseOrderCalculatorService } from '../../domain/services/purchase-calculator.service';
import { CustodyEventType } from '@/modules/custody/domain/custody-event.entity';
import { PurchaseExecutedEvent } from '@/shared/events/domain-events/purchase-executed.event';

@Injectable()
export class ExecutePurchaseUseCase {
  private readonly PURCHASE_DATES_PER_MONTH = 3;

  constructor(
    private readonly basketApi: BasketApiInterface,
    private readonly customerApi: CustomerApiInterface,
    private readonly custodyApi: CustodyApiInterface,
    private readonly quotesApi: QuotesApiInterface,
    private readonly orderApi: OrderApiInterface,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(referenceDate: Date): Promise<void> {
    const basket = await this.basketApi.getActiveBasket();

    if (!basket) {
      throw new DomainError('No active basket found');
    }

    const masterCustody = await this.custodyApi.getMasterAccountCustody();

    // Calculate orders
    const purchaseAmount = await this.calculatePurchaseAmount(masterCustody);

    const pricesMap = await this.getPricesMap(basket, referenceDate);

    const { orders, leftovers } = PurchaseOrderCalculatorService.calculate({
      masterCustody: masterCustody,
      items: basket.items,
      prices: pricesMap,
      totalAmount: purchaseAmount,
    });

    // Register orders
    await this.orderApi.registerOrder({
      brokerageAccountId: masterCustody.graphicalAccountId,
      items: orders,
    });

    // Update custody
    await this.custodyApi.updateAccountCustody({
      graphicalAccountId: masterCustody.graphicalAccountId,
      changes: orders.map((order) => ({
        ticker: order.ticker,
        quantity: order.quantity,
        type: CustodyEventType.PURCHASE,
        profit: Money.zero(), // no profit on purchases
        unitaryPrice: order.unitaryPrice,
      })),
      newBalance: leftovers,
    });

    // Publish event
    this.eventBus.publish(
      new PurchaseExecutedEvent(
        masterCustody.graphicalAccountId,
        purchaseAmount,
      ),
    );
  }

  private async calculatePurchaseAmount(
    masterCustody: AccountCustodyResponseDto,
  ): Promise<Money> {
    const totalMonthlyDeposit =
      await this.customerApi.getMonthlyTotalClientDeposit();

    const perDayAmount = totalMonthlyDeposit.divide(
      this.PURCHASE_DATES_PER_MONTH,
    );
    // Include master account balance leftovers
    return perDayAmount.add(masterCustody.currency.amount);
  }

  private async getPricesMap(basket: BasketResponseDto, referenceDate: Date) {
    const tickers = [
      ...basket.items.map((i) => i.ticker),
      ...basket.items.map((i) =>
        PurchaseOrderCalculatorService.toFractionalTicker(i.ticker),
      ),
    ];
    const quotes = await this.quotesApi.getQuotes(tickers, referenceDate);

    const pricesMap = quotes.reduce((map, quote) => {
      return map.set(quote.ticker, quote.closingPrice);
    }, new Map<string, Money>());

    return pricesMap;
  }
}
