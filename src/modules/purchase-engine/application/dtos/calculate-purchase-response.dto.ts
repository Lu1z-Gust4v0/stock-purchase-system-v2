import { MarketType } from '@/modules/order/domain/order.entity';
import { Money } from '@/shared/domain/money.vo';

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

export interface CalculatePurchaseResponse {
  totalAmount: Money;
  orders: PurchaseOrderItem[];
  leftovers: Money;
}
