import type { Client, GraphicalAccount } from '@/generated/prisma/client';
import { Customer } from '@/modules/customer/domain/customer.entity';

type ClientWithAccount = Client & {
  graphicalAccount: Pick<GraphicalAccount, 'id'> | null;
};

export class CustomerMapper {
  static toDomain(record: ClientWithAccount): Customer {
    return Customer.reconstitute(record.id, {
      name: record.name,
      mainDocumentCode: record.mainDocumentCode,
      email: record.email,
      monthlyAmount: Number(record.monthlyDeposit),
      active: record.active,
      brokerageAccountId: record.graphicalAccount?.id ?? null,
      createdAt: record.createdAt,
    });
  }
}
