import { GetQuoteRequestDto } from '@/modules/quote/application/dtos/get-quote-request.dto';
import {
  QuoteResponseDto,
  QuoteResponseMapper,
} from '@/modules/quote/application/dtos/quote-response.dto';
import { QuoteRepositoryPort } from '@/modules/quote/application/ports/quote-repository.port';
import { GetHistoricalQuotesUseCase } from '@/modules/quote/application/use-cases/get-historical-quotes.use-case';

export class GetQuoteUseCase {
  constructor(
    private readonly quoteRepo: QuoteRepositoryPort,
    private readonly getHistoricalQuotes: GetHistoricalQuotesUseCase,
  ) {}

  async execute(dto: GetQuoteRequestDto): Promise<QuoteResponseDto[]> {
    const fromDb = await this.quoteRepo.findByTickersAndDate(
      dto.tickers,
      dto.date,
    );

    if (fromDb.length !== dto.tickers.length) {
      return await this.getHistoricalQuotes.execute({
        tickers: dto.tickers,
        date: dto.date,
      });
    }

    return fromDb.map((q) => QuoteResponseMapper.toResponse(q));
  }
}
