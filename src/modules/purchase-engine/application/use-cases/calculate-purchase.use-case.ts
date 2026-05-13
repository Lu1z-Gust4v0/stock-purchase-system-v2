import { Injectable } from '@nestjs/common';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { Money } from '@/shared/domain/money.vo';
import { DomainError } from '@/shared/errors/domain.exception';
import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';
import {
  CalculatePurchaseResponse,
  PurchaseOrderItem,
} from '../dtos/calculate-purchase-response.dto';

@Injectable()
export class CalculatePurchaseUseCase {
  private static readonly PURCHASE_DATES_PER_MONTH = 3;
  private static readonly FRACTIONAL_TICKER_SUFFIX = 'F';

  constructor(
    private readonly customerApi: CustomerApiInterface,
    private readonly quotesApi: QuotesApiInterface,
    private readonly orderApi: OrderApiInterface,
  ) {}

  async execute(
    masterCustody: AccountCustodyResponseDto,
    basket: BasketResponseDto,
    referenceDate: Date,
  ): Promise<CalculatePurchaseResponse> {
    const totalAmount = await this.calculatePurchaseAmount(masterCustody);
    const prices = await this.getPricesMap(basket, referenceDate);

    const purchaseOrders: PurchaseOrderItem[] = [];
    let purchaseAmount = Money.zero();

    for (const item of basket.items) {
      const spotPrice = this.getPriceOrThrow(item.ticker, prices);
      const fractionalPrice = this.getPriceOrThrow(
        this.toFractionalTicker(item.ticker),
        prices,
      );

      const allocation = totalAmount.multiply(item.allocationPercentage / 100);
      const initialQuantity = Math.floor(allocation.amount / spotPrice.amount);
      const quantityInCustody =
        masterCustody.positions[item.ticker]?.quantity ?? 0;
      const signedQuantity = initialQuantity - quantityInCustody;

      const { orders, orderAmount } = this.orderApi.splitIntoLotOrders({
        ticker: item.ticker,
        signedQuantity,
        spotPrice,
        fractionalPrice,
      });

      purchaseOrders.push(...orders);
      purchaseAmount = purchaseAmount.add(orderAmount);
    }

    return {
      totalAmount,
      orders: purchaseOrders,
      leftovers: totalAmount.subtract(purchaseAmount),
    };
  }

  private async calculatePurchaseAmount(
    masterCustody: AccountCustodyResponseDto,
  ): Promise<Money> {
    const totalMonthlyDeposit =
      await this.customerApi.getMonthlyTotalClientDeposit();

    const perDayAmount = totalMonthlyDeposit.divide(
      CalculatePurchaseUseCase.PURCHASE_DATES_PER_MONTH,
    );
    return perDayAmount.add(masterCustody.currency.amount);
  }

  private async getPricesMap(basket: BasketResponseDto, referenceDate: Date) {
    const tickers = [
      ...basket.items.map((i) => i.ticker),
      ...basket.items.map((i) => this.toFractionalTicker(i.ticker)),
    ];
    const quotes = await this.quotesApi.getQuotes(tickers, referenceDate);

    return quotes.reduce((map, quote) => {
      return map.set(quote.ticker, quote.closingPrice);
    }, new Map<string, Money>());
  }

  private getPriceOrThrow(ticker: string, prices: Map<string, Money>): Money {
    const price = prices.get(ticker);

    if (price === undefined || price.amount <= 0) {
      throw new DomainError(`No valid price found for ticker ${ticker}`);
    }

    return price;
  }

  private toFractionalTicker(ticker: string): string {
    return `${ticker}${CalculatePurchaseUseCase.FRACTIONAL_TICKER_SUFFIX}`;
  }
}
