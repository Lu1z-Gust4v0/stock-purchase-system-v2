import { GraphicalAccount as PrismaGraphicalAccount } from '@/generated/prisma/client';
import {
  GraphicalAccount,
  AccountType,
} from '@/modules/custody/domain/graphical-account.entity';

export class GraphicalAccountMapper {
  static toDomain(record: PrismaGraphicalAccount): GraphicalAccount {
    return GraphicalAccount.reconstitute(
      record.id,
      record.clientId,
      record.account,
      record.type as AccountType,
      record.createdAt,
    );
  }
}
