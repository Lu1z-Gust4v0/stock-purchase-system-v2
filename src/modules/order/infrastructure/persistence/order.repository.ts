import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { OrderRepositoryPort } from '@/modules/order/application/ports/order-repository.port';
import { Order } from '@/modules/order/domain/order.entity';

@Injectable()
export class OrderRepository implements OrderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: Order): Promise<void> {
    await this.prisma.order.createMany({
      data: order.items.map((item) => ({
        id: randomUUID(),
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
