import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';
import {
  QUOTE_REPOSITORY_PORT,
  QuoteRepositoryPort,
} from '@/modules/quote/application/ports/quote-repository.port';
import {
  QUOTE_HISTORY_PARSER_PORT,
  QuoteHistoryParserPort,
} from '@/modules/quote/application/ports/quote-history-parser.port';
import { QuoteRepository } from '@/modules/quote/infrastructure/persistence/quote.repository';
import { QuoteHistoryParser } from '@/modules/quote/infrastructure/parsers/cotahist.parser';
import { QuotesController } from '@/modules/quote/infrastructure/web/quotes.controller';
import { GetHistoricalQuotesUseCase } from '@/modules/quote/application/use-cases/get-historical-quotes.use-case';
import { GetQuoteUseCase } from '@/modules/quote/application/use-cases/get-quote.use-case';
import { QUOTES_API } from '@/modules/quote/api/quotes-api.interface';
import { QuotesApi } from '@/modules/quote/api/quotes.api';

@Module({
  imports: [PrismaModule],
  controllers: [QuotesController],
  providers: [
    {
      provide: QUOTE_REPOSITORY_PORT,
      useClass: QuoteRepository,
    },
    {
      provide: QUOTE_HISTORY_PARSER_PORT,
      useClass: QuoteHistoryParser,
    },
    {
      provide: GetHistoricalQuotesUseCase,
      useFactory: (repo: QuoteRepositoryPort, parser: QuoteHistoryParserPort) =>
        new GetHistoricalQuotesUseCase(repo, parser),
      inject: [QUOTE_REPOSITORY_PORT, QUOTE_HISTORY_PARSER_PORT],
    },
    {
      provide: GetQuoteUseCase,
      useFactory: (
        repo: QuoteRepositoryPort,
        getHistoricalQuotes: GetHistoricalQuotesUseCase,
      ) => new GetQuoteUseCase(repo, getHistoricalQuotes),
      inject: [QUOTE_REPOSITORY_PORT, GetHistoricalQuotesUseCase],
    },
    {
      provide: QUOTES_API,
      useFactory: (useCase: GetQuoteUseCase) => new QuotesApi(useCase),
      inject: [GetQuoteUseCase],
    },
  ],
  exports: [QUOTES_API, QUOTE_HISTORY_PARSER_PORT],
})
export class QuoteModule {}
