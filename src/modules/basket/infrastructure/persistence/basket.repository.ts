import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { BasketRepositoryPort } from '@/modules/basket/application/ports/basket-repository.port';
import { RecommendationBasket } from '@/modules/basket/domain/recommendation-basket.entity';
import { BasketMapper } from '@/modules/basket/infrastructure/persistence/mappers/basket.mapper';

@Injectable()
export class BasketRepository implements BasketRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(basket: RecommendationBasket): Promise<void> {
    const exists = await this.prisma.basket.findUnique({
      where: { id: basket.id },
    });

    if (exists) {
      await this.prisma.basket.update({
        where: { id: basket.id },
        data: { active: basket.active },
      });
      return;
    }

    await this.prisma.basket.create({
      data: {
        id: basket.id,
        name: basket.name,
        active: basket.active,
        createdAt: basket.createdAt,
        items: {
          create: basket.items.map((item) => ({
            id: uuidv7(),
            code: item.ticker,
            percentage: item.allocationPercentage,
          })),
        },
      },
    });
  }

  async findActive(): Promise<RecommendationBasket | null> {
    const record = await this.prisma.basket.findFirst({
      where: { active: true },
      include: { items: true },
    });
    if (!record) return null;
    return BasketMapper.toDomain(record);
  }

  async findById(id: string): Promise<RecommendationBasket | null> {
    const record = await this.prisma.basket.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!record) return null;
    return BasketMapper.toDomain(record);
  }

  async findAll(): Promise<RecommendationBasket[]> {
    const records = await this.prisma.basket.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => BasketMapper.toDomain(r));
  }
}
