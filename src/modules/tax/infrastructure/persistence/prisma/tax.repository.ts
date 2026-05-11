import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import type { TaxRepositoryPort } from '@/modules/tax/application/ports/tax-repository.port';
import type { Tax } from '@/modules/tax/domain/tax.entity';

export class TaxRepository implements TaxRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(tax: Tax): Promise<void> {
    await this.prisma.taxEvent.upsert({
      where: { id: tax.id },
      update: {
        published: tax.published,
      },
      create: {
        id: tax.id,
        type: tax.type,
        baseAmount: tax.baseAmount.amount,
        taxAmount: tax.amount.amount,
        published: tax.published,
        graphicalAccountId: tax.graphicalAccountId,
        createdAt: tax.createdAt,
      },
    });
  }
}
