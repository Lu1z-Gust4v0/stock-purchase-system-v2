import { Injectable } from '@nestjs/common';
import { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { RegisterOrderUseCase } from '@/modules/order/application/use-cases/register-order.usecase';
import { RegisterOrderRequestDto } from '@/modules/order/application/dtos/register-order-request.dto';

@Injectable()
export class OrderApi implements OrderApiInterface {
  constructor(private readonly registerOrderUseCase: RegisterOrderUseCase) {}

  async registerOrder(dto: RegisterOrderRequestDto): Promise<void> {
    return this.registerOrderUseCase.execute(dto);
  }
}
