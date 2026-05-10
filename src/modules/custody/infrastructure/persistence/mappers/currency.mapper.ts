import { Currency } from '@/generated/prisma/client';
import {
  CurrencyPosition,
  CurrencyCode,
} from '@/modules/custody/domain/currency-position.entity';
import { Money } from '@/shared/domain/money.vo';

export class CurrencyMapper {
  static toDomain(record: Currency): CurrencyPosition {
    return CurrencyPosition.reconstitute(
      record.id,
      record.graphicalAccountId,
      Money.fromNumber(Number(record.amount)),
      record.code as CurrencyCode,
    );
  }
}
