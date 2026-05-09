import { RegisterOrderRequestDto } from '../application/dtos/register-order-request.dto';

export const ORDER_API = Symbol('ORDER_API');

export interface OrderApiInterface {
  registerOrder(dto: RegisterOrderRequestDto): Promise<void>;
}
