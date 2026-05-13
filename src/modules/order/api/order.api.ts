import { Injectable } from '@nestjs/common';
import { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { RegisterOrderUseCase } from '@/modules/order/application/use-cases/register-order.usecase';
import { RegisterOrderRequestDto } from '@/modules/order/application/dtos/register-order-request.dto';
import { SplitIntoLotOrdersRequestDto } from '../application/dtos/split-into-lot-orders-request.dto';
import { SplitIntoLotOrdersResponseDto } from '../application/dtos/split-into-lot-orders-response.dto';
import { SplitIntoLotOrdersService } from '../domain/services/split-into-lot-orders.service';

@Injectable()
export class OrderApi implements OrderApiInterface {
  constructor(
    private readonly registerOrderUseCase: RegisterOrderUseCase,
    private readonly splitIntoLotOrdersService: SplitIntoLotOrdersService,
  ) {}

  async registerOrder(dto: RegisterOrderRequestDto): Promise<void> {
    return this.registerOrderUseCase.execute(dto);
  }

  splitIntoLotOrders(dto: SplitIntoLotOrdersRequestDto): SplitIntoLotOrdersResponseDto {
    return this.splitIntoLotOrdersService.execute(dto);
  }
}
