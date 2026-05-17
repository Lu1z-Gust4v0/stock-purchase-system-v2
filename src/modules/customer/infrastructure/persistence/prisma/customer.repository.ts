import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { CustomerRepositoryPort } from '@/modules/customer/application/ports/customer-repository.port';
import { Customer } from '@/modules/customer/domain/customer.entity';
import { CustomerMapper } from '../mappers/customer.mapper';
import { Money } from '@/shared/domain/money.vo';

@Injectable()
export class CustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(customer: Customer): Promise<void> {
    await this.prisma.client.upsert({
      where: { id: customer.id },
      update: {
        name: customer.name,
        email: customer.email.value,
        monthlyDeposit: customer.monthlyAmount.value.amount,
        active: customer.active,
      },
      create: {
        id: customer.id,
        name: customer.name,
        email: customer.email.value,
        mainDocumentCode: customer.mainDocumentCode.value,
        monthlyDeposit: customer.monthlyAmount.value.amount,
        active: customer.active,
        createdAt: customer.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    const record = await this.prisma.client.findUnique({
      where: { id },
      include: { graphicalAccount: { select: { id: true } } },
    });
    return record ? CustomerMapper.toDomain(record) : null;
  }

  async findByMainDocumentCode(
    mainDocumentCode: string,
  ): Promise<Customer | null> {
    const record = await this.prisma.client.findUnique({
      where: { mainDocumentCode: mainDocumentCode },
      include: { graphicalAccount: { select: { id: true } } },
    });
    return record ? CustomerMapper.toDomain(record) : null;
  }

  async getMonthlyTotalClientDeposit(): Promise<Money> {
    const aggregate = await this.prisma.client.aggregate({
      _sum: { monthlyDeposit: true },
      where: { active: true, graphicalAccount: { type: 'CHILD' } },
    });

    const total = aggregate._sum.monthlyDeposit?.toNumber() ?? 0;

    return Money.fromNumber(total);
  }

  async findAllActive(): Promise<Customer[]> {
    const records = await this.prisma.client.findMany({
      where: {
        active: true,
        graphicalAccount: {
          type: 'CHILD',
        },
      },
      include: { graphicalAccount: { select: { id: true } } },
    });
    return records.map((record) => CustomerMapper.toDomain(record));
  }

  async countActiveClients(): Promise<number> {
    return await this.prisma.client.count({
      where: { active: true, graphicalAccount: { type: 'CHILD' } },
    });
  }
}
