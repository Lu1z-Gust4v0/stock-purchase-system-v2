import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { OrderRepositoryPort } from '../ports/order-repository.port';
import { RegisterOrderRequestDto } from '../dtos/register-order-request.dto';
import { Order } from '../../domain/order.entity';

@Injectable()
export class RegisterOrderUseCase {
  constructor(private readonly orderRepo: OrderRepositoryPort) {}

  async execute(dto: RegisterOrderRequestDto): Promise<void> {
    const order = Order.create(randomUUID(), dto.brokerageAccountId, dto.items);

    await this.orderRepo.save(order);
  }
}
