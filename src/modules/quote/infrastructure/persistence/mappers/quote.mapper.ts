import { HistoricalQuote } from '@/modules/quote/domain/historical-quote.entity';
import { Quote as QuoteRecord } from '@/generated/prisma/client';

export class QuoteMapper {
  static toDomain(record: QuoteRecord): HistoricalQuote {
    return HistoricalQuote.create(
      record.id,
      record.code,
      record.date,
      Number(record.closingPrice),
    );
  }
}
