import { PurchaseOrderItem } from '@/modules/purchase-engine/domain/purchase-order.entity';
import { Distribution, DistributionItem } from '@/modules/purchase-engine/domain/distribution.entity';
import { Money } from '@/shared/domain/money.vo';

export interface CustomerAllocation {
  customerId: string;
  amount: Money;
}

export class DistributionService {
  distribute(
    purchaseOrderId: string,
    items: PurchaseOrderItem[],
    customerAllocations: CustomerAllocation[],
    generateId: () => string,
  ): Distribution[] {
    const totalAmount = customerAllocations.reduce(
      (sum, a) => sum.add(a.amount),
      Money.zero(),
    );

    return customerAllocations.map((allocation) => {
      const proportion = allocation.amount.amount / totalAmount.amount;

      const distributionItems: DistributionItem[] = items.map((item) => {
        const totalQty = item.standardLotQuantity + item.fractionalQuantity;
        return {
          ticker: item.ticker,
          quantity: Number.parseFloat((totalQty * proportion).toFixed(4)),
          averagePrice: item.price,
        };
      });

      return Distribution.create(
        generateId(),
        purchaseOrderId,
        allocation.customerId,
        distributionItems,
      );
    });
  }
}
