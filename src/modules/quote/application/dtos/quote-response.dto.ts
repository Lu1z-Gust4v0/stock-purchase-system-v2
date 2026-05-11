import { HistoricalQuote } from '@/modules/quote/domain/historical-quote.entity';
import { Money } from '@/shared/domain/money.vo';

export interface QuoteResponseDto {
  ticker: string;
  date: string;
  closingPrice: Money;
}

export class QuoteResponseMapper {
  static toResponse(quote: HistoricalQuote): QuoteResponseDto {
    return {
      ticker: quote.ticker,
      date: quote.date.toISOString(),
      closingPrice: quote.closingPrice,
    };
  }
}
