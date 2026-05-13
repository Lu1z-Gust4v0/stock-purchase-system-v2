import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { Money } from '@/shared/domain/money.vo';
import { DomainError } from '@/shared/errors/domain.exception';
import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';
import { CustodyEventType } from '@/modules/custody/domain/custody-event.entity';
import { OrderItem } from '@/modules/order/domain/order.entity';

export type { OrderItem } from '@/modules/order/domain/order.entity';

export interface ChangeItem {
  type: CustodyEventType;
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
  profit: Money;
}

export interface RebalanceCalculatorResponse {
  orders: OrderItem[];
  changes: ChangeItem[];
  leftovers: Money;
}

export type RebalanceQuantities = Record<string, number>;

export abstract class RebalanceCalculator {
  protected static readonly FRACTIONAL_TICKER_SUFFIX = 'F';

  constructor(
    protected readonly quotesApi: QuotesApiInterface,
    protected readonly orderApi: OrderApiInterface,
  ) {}

  protected async fetchPrices(
    basket: BasketResponseDto,
    accountCustody: AccountCustodyResponseDto,
  ): Promise<Map<string, Money>> {
    const tickers = new Set<string>();

    for (const item of basket.items) {
      tickers.add(item.ticker);
      tickers.add(this.toFractionalTicker(item.ticker));
    }
    for (const ticker of Object.keys(accountCustody.positions)) {
      tickers.add(ticker);
      tickers.add(this.toFractionalTicker(ticker));
    }

    const quotes = await this.quotesApi.getQuotes(
      Array.from(tickers),
      new Date(),
    );

    return new Map(quotes.map((quote) => [quote.ticker, quote.closingPrice]));
  }

  protected getPriceOrThrow(ticker: string, prices: Map<string, Money>): Money {
    const price = prices.get(ticker);

    if (price === undefined || price.amount <= 0) {
      throw new DomainError(`No valid price found for ticker ${ticker}`);
    }

    return price;
  }

  protected toFractionalTicker(ticker: string): string {
    return `${ticker}${RebalanceCalculator.FRACTIONAL_TICKER_SUFFIX}`;
  }

  protected computeCustodyValue(
    accountCustody: AccountCustodyResponseDto,
    prices: Map<string, Money>,
  ): Money {
    return Object.entries(accountCustody.positions).reduce(
      (acc, [ticker, info]) =>
        acc.add(this.getPriceOrThrow(ticker, prices).multiply(info.quantity)),
      Money.zero(),
    );
  }

  protected buildOrders(
    quantities: RebalanceQuantities,
    prices: Map<string, Money>,
  ): { orders: OrderItem[]; netSpent: Money } {
    const orders: OrderItem[] = [];
    let netSpent = Money.zero();

    for (const [ticker, signedQuantity] of Object.entries(quantities)) {
      if (signedQuantity === 0) continue;

      const spotPrice = this.getPriceOrThrow(ticker, prices);
      const fractionalPrice = this.getPriceOrThrow(
        this.toFractionalTicker(ticker),
        prices,
      );

      const { orders: lotOrders, orderAmount } =
        this.orderApi.splitIntoLotOrders({
          ticker,
          signedQuantity,
          spotPrice,
          fractionalPrice,
        });

      orders.push(...lotOrders);
      netSpent =
        signedQuantity > 0
          ? netSpent.add(orderAmount)
          : netSpent.subtract(orderAmount);
    }

    return { orders, netSpent };
  }

  protected buildChanges(
    quantities: RebalanceQuantities,
    accountCustody: AccountCustodyResponseDto,
    prices: Map<string, Money>,
  ): ChangeItem[] {
    const changes: ChangeItem[] = [];

    for (const [ticker, quantity] of Object.entries(quantities)) {
      if (quantity === 0) continue;

      const unitaryPrice = this.getPriceOrThrow(ticker, prices);
      const isSale = quantity < 0;
      const profit = isSale
        ? unitaryPrice
            .subtract(accountCustody.positions[ticker].averagePrice)
            .multiply(Math.abs(quantity))
        : Money.zero();

      changes.push({
        type: isSale ? CustodyEventType.SALE : CustodyEventType.PURCHASE,
        ticker,
        quantity,
        unitaryPrice,
        profit,
      });
    }

    return changes;
  }
}
