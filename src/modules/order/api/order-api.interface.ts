import { RegisterOrderRequestDto } from '../application/dtos/register-order-request.dto';
import { SplitIntoLotOrdersRequestDto } from '../application/dtos/split-into-lot-orders-request.dto';
import { SplitIntoLotOrdersResponseDto } from '../application/dtos/split-into-lot-orders-response.dto';

export const ORDER_API = Symbol('ORDER_API');

export interface OrderApiInterface {
  registerOrder(dto: RegisterOrderRequestDto): Promise<void>;
  splitIntoLotOrders(dto: SplitIntoLotOrdersRequestDto): SplitIntoLotOrdersResponseDto;
}
