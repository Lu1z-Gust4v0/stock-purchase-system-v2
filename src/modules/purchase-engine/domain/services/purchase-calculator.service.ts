import { DomainError } from '@/shared/errors/domain.exception';
import { Money } from '@/shared/domain/money.vo';
import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { MarketType } from '@/modules/order/domain/order.entity';

export interface PurchaseItem {
  ticker: string;
  allocationPercentage: number;
}

export interface PurchaseCalculationInput {
  masterCustody: AccountCustodyResponseDto;
  totalAmount: Money;
  items: PurchaseItem[];
  prices: Map<string, Money>;
}

export interface PurchaseOrderItem {
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
  marketType: MarketType;
}

export interface PurchaseOrder {
  orders: PurchaseOrderItem[];
  leftovers: Money;
}

export class PurchaseOrderCalculatorService {
  // B3 standard lot is 100 shares; remainder goes to fractional market
  static readonly FRACTIONAL_TICKER_SUFFIX = 'F';
  static readonly STANDARD_LOT_SIZE = 100;

  static calculate(input: PurchaseCalculationInput): PurchaseOrder {
    const { masterCustody, totalAmount, items, prices } = input;

    const orders: PurchaseOrderItem[] = [];
    const purchaseAmount = Money.zero();

    items.forEach((item) => {
      const price = this.getPriceOrThrow(item.ticker, prices);

      const allocation = totalAmount.multiply(item.allocationPercentage / 100);
      const initialQuantity = Math.floor(allocation.amount / price.amount);
      const quantityInCustody =
        masterCustody.positions.get(item.ticker)?.quantity ?? 0;

      // Use leftovers stocks from master custody
      const totalQuantity = initialQuantity - quantityInCustody;

      const fractionalQuantity = totalQuantity % this.STANDARD_LOT_SIZE;
      const standardLotQuantity = totalQuantity - fractionalQuantity;

      // Create Fractional Order (1-99 shares)
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

        purchaseAmount.add(fractionalPrice.multiply(fractionalQuantity));
      }

      // Create Spot Order (Standard Lot)
      if (standardLotQuantity >= this.STANDARD_LOT_SIZE) {
        orders.push({
          marketType: MarketType.SPOT,
          quantity: standardLotQuantity,
          ticker: item.ticker,
          unitaryPrice: price,
        });

        purchaseAmount.add(price.multiply(standardLotQuantity));
      }
    });

    return { orders, leftovers: totalAmount.subtract(purchaseAmount) };
  }

  static getPriceOrThrow(ticker: string, prices: Map<string, Money>) {
    const price = prices.get(ticker);

    if (price === undefined || price.amount <= 0) {
      throw new DomainError(`No valid price found for ticker ${ticker}`);
    }

    return price;
  }

  static toFractionalTicker(ticker: string) {
    return `${ticker}${this.FRACTIONAL_TICKER_SUFFIX}`;
  }
}
