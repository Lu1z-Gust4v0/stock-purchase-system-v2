import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { CustodyRepositoryPort } from '@/modules/custody/application/ports/custody-repository.port';
import { AccountCustody } from '@/modules/custody/domain/account-custody.entity';
import { CustodyMapper } from '../mappers/custody.mapper';
import { CurrencyMapper } from '../mappers/currency.mapper';

export class CustodyRepository implements CustodyRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(custody: AccountCustody): Promise<void> {
    const custodyOperations = Array.from(custody.positions, ([, position]) =>
      this.prisma.custody.upsert({
        where: {
          graphicalAccountId_code: {
            graphicalAccountId: custody.graphicalAccountId,
            code: position.ticker,
          },
        },
        update: {
          averagePrice: position.averagePrice.amount,
          quantity: position.quantity,
          updatedAt: new Date(),
        },
        create: {
          id: position.id,
          code: position.ticker,
          averagePrice: position.averagePrice.amount,
          quantity: position.quantity,
          graphicalAccountId: custody.graphicalAccountId,
        },
      }),
    );

    const eventsOperations = custody.custodyEvents.map((event) =>
      this.prisma.custodyEvent.create({
        data: {
          id: event.id,
          code: event.ticker,
          profit: event.profit.amount,
          unitaryPrice: event.unitaryPrice.amount,
          quantity: event.quantity,
          type: event.type,
          graphicalAccountId: custody.graphicalAccountId,
        },
      }),
    );

    const currencyOperation = this.prisma.currency.upsert({
      where: {
        graphicalAccountId: custody.graphicalAccountId,
      },
      update: {
        amount: custody.currency.amount.amount,
        updatedAt: custody.currency.updatedAt,
      },
      create: {
        id: custody.currency.id,
        amount: custody.currency.amount.amount,
        code: custody.currency.code,
        graphicalAccountId: custody.graphicalAccountId,
      },
    });

    await this.prisma.$transaction([
      ...custodyOperations,
      ...eventsOperations,
      currencyOperation,
    ]);
  }

  async findByAccountId(accountId: string): Promise<AccountCustody | null> {
    const [records, currency] = await Promise.all([
      this.prisma.custody.findMany({
        where: { graphicalAccountId: accountId },
      }),
      this.prisma.currency.findUnique({
        where: { graphicalAccountId: accountId },
      }),
    ]);

    if (!currency) return null;

    const positions = records.map((r) => CustodyMapper.toDomain(r));

    return AccountCustody.reconstitute(
      accountId,
      accountId,
      positions,
      CurrencyMapper.toDomain(currency),
    );
  }

  async getMonthlySalesVolume(
    accountId: string,
    referenceDate: Date,
  ): Promise<number> {
    const { startOfMonth, startOfNextMonth } =
      this.getMonthBoundary(referenceDate);

    const [{ total }] = await this.prisma.$queryRaw<[{ total: string | null }]>`
      SELECT SUM(ABS(quantity) * unitary_price)::TEXT AS total
      FROM custody_events
      WHERE graphical_account_id = ${accountId}
        AND type = 'SALE'
        AND created_at >= ${startOfMonth}
        AND created_at < ${startOfNextMonth}
    `;

    return total ? Number.parseFloat(total) : 0;
  }

  async getMonthlyProfitVolume(
    accountId: string,
    referenceDate: Date,
  ): Promise<number> {
    const { startOfMonth, startOfNextMonth } =
      this.getMonthBoundary(referenceDate);

    const [{ total }] = await this.prisma.$queryRaw<[{ total: string | null }]>`
      SELECT SUM(profit)::TEXT AS total
      FROM custody_events
      WHERE graphical_account_id = ${accountId}
        AND type = 'SALE'
        AND created_at >= ${startOfMonth}
        AND created_at < ${startOfNextMonth}
    `;

    return total ? Number.parseFloat(total) : 0;
  }

  private getMonthBoundary(referenceDate: Date) {
    const year = referenceDate.getUTCFullYear();
    const month = referenceDate.getUTCMonth();

    const startOfMonth = new Date(Date.UTC(year, month, 1));
    const startOfNextMonth = new Date(Date.UTC(year, month + 1, 1));

    return { startOfMonth, startOfNextMonth };
  }
}
