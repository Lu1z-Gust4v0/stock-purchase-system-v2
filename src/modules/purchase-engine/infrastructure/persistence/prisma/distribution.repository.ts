import { DistributionRepositoryPort } from '@/modules/purchase-engine/application/ports/distribution-repository.port';
import { Distribution } from '@/modules/purchase-engine/domain/distribution.entity';
import { Money } from '@/shared/domain/money.vo';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DistributionRepository implements DistributionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(distribution: Distribution): Promise<void> {
    await this.prisma.distribution.create({
      data: {
        id: distribution.id,
        amount: distribution.amount.amount,
        code: distribution.amount.currency,
        graphicalAccountId: distribution.destination,
        createdAt: distribution.createdAt.toISOString(),
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
