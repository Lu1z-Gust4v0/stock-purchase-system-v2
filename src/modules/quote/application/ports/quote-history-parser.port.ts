import { HistoricalQuote } from '@/modules/quote/domain/historical-quote.entity';

export const QUOTE_HISTORY_PARSER_PORT = Symbol('QUOTE_HISTORY_PARSER_PORT');

export interface QuoteHistoryParserPort {
  parse(filePath: string): Promise<HistoricalQuote[]>;
}
