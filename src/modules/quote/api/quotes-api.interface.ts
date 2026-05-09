import { QuoteResponseDto } from '@/modules/quote/application/dtos/quote-response.dto';

export const QUOTES_API = Symbol('QUOTES_API');

export interface QuotesApiInterface {
  getQuotes(tickers: string[], date?: Date): Promise<QuoteResponseDto[]>;
}
