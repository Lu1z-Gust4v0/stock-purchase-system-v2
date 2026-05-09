import { HistoricalQuote } from '@/modules/quote/domain/historical-quote.entity';

export interface QuoteResponseDto {
  ticker: string;
  date: string;
  closingPrice: number;
}

export class QuoteResponseMapper {
  static toResponse(quote: HistoricalQuote): QuoteResponseDto {
    return {
      ticker: quote.ticker,
      date: quote.date.toISOString(),
      closingPrice: quote.closingPrice.amount,
    };
  }
}
