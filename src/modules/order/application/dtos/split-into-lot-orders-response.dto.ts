import { Money } from '@/shared/domain/money.vo';
import { OrderItemDto } from './register-order-request.dto';

export interface SplitIntoLotOrdersResponseDto {
  orders: OrderItemDto[];
  orderAmount: Money;
}
