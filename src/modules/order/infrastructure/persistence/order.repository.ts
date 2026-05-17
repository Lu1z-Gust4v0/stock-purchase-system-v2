import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { OrderRepositoryPort } from '@/modules/order/application/ports/order-repository.port';
import { Order } from '@/modules/order/domain/order.entity';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class OrderRepository implements OrderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: Order): Promise<void> {
    await this.prisma.order.createMany({
      data: order.items.map((item) => ({
        id: uuidv7(),
        code: item.ticker,
        quantity: item.quantity,
        unitaryPrice: item.unitaryPrice.amount,
        graphicalAccountId: order.brokerageAccountId,
        marketType: item.marketType,
        createdAt: order.createdAt,
      })),
    });
  }
}
