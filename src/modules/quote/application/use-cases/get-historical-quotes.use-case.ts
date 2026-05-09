import * as path from 'node:path';
import { DomainError } from '@/shared/errors/domain.exception';
import { QuoteHistoryParserPort } from '@/modules/quote/application/ports/quote-history-parser.port';
import { GetHistoricalQuotesRequestDto } from '@/modules/quote/application/dtos/get-historical-quotes-request.dto';
import {
  QuoteResponseDto,
  QuoteResponseMapper,
} from '@/modules/quote/application/dtos/quote-response.dto';

export class GetHistoricalQuotesUseCase {
  constructor(private readonly parser: QuoteHistoryParserPort) {}

  async execute(
    dto: GetHistoricalQuotesRequestDto,
  ): Promise<QuoteResponseDto[]> {
    const targetDate = dto.date ?? new Date();

    const filePath = this.resolveFilePath(targetDate);
    const allQuotes = await this.parser.parse(filePath);

    const tickerSet = new Set(dto.tickers);
    const matched = allQuotes.filter((q) => tickerSet.has(q.ticker));

    const foundTickers = new Set(matched.map((q) => q.ticker));
    const missing = dto.tickers.filter((t) => !foundTickers.has(t));

    if (missing.length > 0) {
      const dateStr = targetDate.toISOString().slice(0, 10);
      throw new DomainError(
        `Quotes not found in COTAHIST for tickers: ${missing.join(', ')} on ${dateStr}`,
        404,
      );
    }

    return matched.map((q) => QuoteResponseMapper.toResponse(q));
  }

  private resolveFilePath(date: Date): string {
    const yyyymmdd = date.toISOString().slice(0, 10).replaceAll('-', '');
    return path.join(process.cwd(), 'quotes', `COTAHIST_D${yyyymmdd}.txt`);
  }
}
