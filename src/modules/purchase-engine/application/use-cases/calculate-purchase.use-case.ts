import { Injectable } from '@nestjs/common';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import { Money } from '@/shared/domain/money.vo';
import { DomainError } from '@/shared/errors/domain.exception';
import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';
import { MarketType } from '@/modules/order/domain/order.entity';

export interface PurchaseItem {
  ticker: string;
  allocationPercentage: number;
}

export interface PurchaseOrderItem {
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
  marketType: MarketType;
}

export interface CalculatePurchaseResult {
  totalAmount: Money;
  orders: PurchaseOrderItem[];
  leftovers: Money;
}

@Injectable()
export class CalculatePurchaseUseCase {
  private readonly PURCHASE_DATES_PER_MONTH = 3;
  private readonly FRACTIONAL_TICKER_SUFFIX = 'F';
  private readonly STANDARD_LOT_SIZE = 100;

  constructor(
    private readonly customerApi: CustomerApiInterface,
    private readonly custodyApi: CustodyApiInterface,
    private readonly quotesApi: QuotesApiInterface,
  ) {}

  async execute(
    basket: BasketResponseDto,
    referenceDate: Date,
  ): Promise<CalculatePurchaseResult> {
    const masterCustody = await this.custodyApi.getMasterAccountCustody();
    const totalAmount = await this.calculatePurchaseAmount(masterCustody);
    const prices = await this.getPricesMap(basket, referenceDate);

    const orders: PurchaseOrderItem[] = [];
    let purchaseAmount = Money.zero();

    basket.items.forEach((item) => {
      const price = this.getPriceOrThrow(item.ticker, prices);

      const allocation = totalAmount.multiply(item.allocationPercentage / 100);
      const initialQuantity = Math.floor(allocation.amount / price.amount);
      const quantityInCustody =
        masterCustody.positions[item.ticker]?.quantity ?? 0;

      const totalQuantity = initialQuantity - quantityInCustody;

      const fractionalQuantity = totalQuantity % this.STANDARD_LOT_SIZE;
      const standardLotQuantity = totalQuantity - fractionalQuantity;

      if (fractionalQuantity > 0) {
        const fractionalPrice = this.getPriceOrThrow(
          this.toFractionalTicker(item.ticker),
          prices,
        );

        orders.push({
          marketType: MarketType.FRACTIONAL,
          quantity: fractionalQuantity,
          ticker: item.ticker,
          unitaryPrice: fractionalPrice,
        });

        purchaseAmount = purchaseAmount.add(
          fractionalPrice.multiply(fractionalQuantity),
        );
      }

      if (standardLotQuantity >= this.STANDARD_LOT_SIZE) {
        orders.push({
          marketType: MarketType.SPOT,
          quantity: standardLotQuantity,
          ticker: item.ticker,
          unitaryPrice: price,
        });

        purchaseAmount = purchaseAmount.add(
          price.multiply(standardLotQuantity),
        );
      }
    });

    return {
      totalAmount,
      orders,
      leftovers: totalAmount.subtract(purchaseAmount),
    };
  }

  private async calculatePurchaseAmount(
    masterCustody: AccountCustodyResponseDto,
  ): Promise<Money> {
    const totalMonthlyDeposit =
      await this.customerApi.getMonthlyTotalClientDeposit();

    const perDayAmount = totalMonthlyDeposit.divide(
      this.PURCHASE_DATES_PER_MONTH,
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
    return `${ticker}${this.FRACTIONAL_TICKER_SUFFIX}`;
  }
}
