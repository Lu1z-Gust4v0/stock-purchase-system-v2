import type { TaxEvent } from '@/generated/prisma/client';
import { Tax, TaxType } from '@/modules/tax/domain/tax.entity';
import { Money, Currency } from '@/shared/domain/money.vo';

export class TaxMapper {
  static toDomain(record: TaxEvent): Tax {
    return Tax.reconstitute(
      record.id,
      record.type as TaxType,
      Money.fromNumber(Number(record.baseAmount), Currency.BRL),
      Money.fromNumber(Number(record.taxAmount), Currency.BRL),
      record.published,
      record.graphicalAccountId,
      record.createdAt,
    );
  }
}
