import { PurchaseOrderItem } from '@/modules/purchase-engine/domain/purchase-order.entity';
import { Distribution, DistributionItem } from '@/modules/purchase-engine/domain/distribution.entity';

export interface CustomerAllocation {
  customerId: string;
  amount: number;
}

export class DistributionService {
  distribute(
    purchaseOrderId: string,
    items: PurchaseOrderItem[],
    customerAllocations: CustomerAllocation[],
    generateId: () => string,
  ): Distribution[] {
    const totalAmount = customerAllocations.reduce(
      (sum, a) => sum + a.amount,
      0,
    );

    return customerAllocations.map((allocation) => {
      const proportion = allocation.amount / totalAmount;

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
