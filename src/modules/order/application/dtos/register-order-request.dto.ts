import { Money } from '@/shared/domain/money.vo';
import { MarketType } from '../../domain/order.entity';

export interface OrderItemDto {
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
  marketType: MarketType;
}

export interface RegisterOrderRequestDto {
  brokerageAccountId: string;
  items: OrderItemDto[];
}
