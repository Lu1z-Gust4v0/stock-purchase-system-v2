import { PurchaseOrderItem } from '@/modules/purchase-engine/domain/purchase-order.entity';
import { DomainError } from '@/shared/errors/domain.exception';

export interface BasketAllocation {
  ticker: string;
  allocationPercentage: number;
}

export interface PurchaseCalculationInput {
  totalAmount: number;
  basket: BasketAllocation[];
  prices: Map<string, number>;
}

export class PurchaseCalculatorService {
  // B3 standard lot is 100 shares; remainder goes to fractional market
  static readonly STANDARD_LOT_SIZE = 100;

  calculate(input: PurchaseCalculationInput): PurchaseOrderItem[] {
    const { totalAmount, basket, prices } = input;

    return basket.map((item) => {
      const price = prices.get(item.ticker);
      if (price === undefined || price <= 0) {
        throw new DomainError(`No valid price found for ticker ${item.ticker}`);
      }

      const allocation = (item.allocationPercentage / 100) * totalAmount;
      const totalQuantity = allocation / price;
      const standardLotQuantity =
        Math.floor(
          totalQuantity / PurchaseCalculatorService.STANDARD_LOT_SIZE,
        ) * PurchaseCalculatorService.STANDARD_LOT_SIZE;
      const fractionalQuantity = Number.parseFloat(
        (totalQuantity - standardLotQuantity).toFixed(4),
      );

      const quantity = standardLotQuantity + fractionalQuantity;
      return {
        ticker: item.ticker,
        standardLotQuantity,
        fractionalQuantity,
        price,
        totalCost: Number.parseFloat((quantity * price).toFixed(2)),
      };
    });
  }
}
