import {
  DistributionRepositoryPort,
  SaveDistributionDto,
} from '@/modules/custody/application/ports/distribution-repository.port';
import { Money } from '@/shared/domain/money.vo';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DistributionRepository implements DistributionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(dto: SaveDistributionDto): Promise<void> {
    await this.prisma.distribution.create({
      data: {
        amount: dto.amount.amount,
        code: dto.amount.currency,
        graphicalAccountId: dto.graphicalAccountId,
        createdAt: dto.createdAt.toISOString(),
      },
    });
  }

  async getTotalDistributionVolumeByAccountId(
    accountId: string,
  ): Promise<Money> {
    const aggregate = await this.prisma.distribution.aggregate({
      _sum: { amount: true },
      where: {
        graphicalAccountId: accountId,
      },
    });

    const total = aggregate._sum.amount?.toNumber() ?? 0;

    return Money.fromNumber(total);
  }
}
