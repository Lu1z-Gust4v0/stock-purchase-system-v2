import { HistoricalQuote } from '@/modules/quote/domain/historical-quote.entity';
import { Money } from '@/shared/domain/money.vo';
import { Quote as QuoteRecord } from '@/generated/prisma/client';

export class QuoteMapper {
  static toDomain(record: QuoteRecord): HistoricalQuote {
    return HistoricalQuote.create(
      record.id,
      record.code,
      record.date,
      Money.fromNumber(Number(record.closingPrice)),
    );
  }
}
