import { HistoricalQuote } from '@/modules/quote/domain/historical-quote.entity';

export const QUOTE_REPOSITORY_PORT = Symbol('QUOTE_REPOSITORY_PORT');

export interface QuoteRepositoryPort {
  save(quote: HistoricalQuote): Promise<void>;
  saveMany(quotes: HistoricalQuote[]): Promise<void>;
  findByTickersAndDate(
    tickers: string[],
    date?: Date,
  ): Promise<HistoricalQuote[]>;
}
