import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { GetQuoteUseCase } from '@/modules/quote/application/use-cases/get-quote.use-case';
import { QuoteResponseDto } from '@/modules/quote/application/dtos/quote-response.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly getQuote: GetQuoteUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getByTickers(
    @Query('tickers') tickersParam: string,
    @Query('date') dateStr?: string,
  ): Promise<QuoteResponseDto[]> {
    const tickers = tickersParam.split(',').map((t) => t.trim().toUpperCase());

    const date = dateStr ? new Date(dateStr) : new Date();

    return this.getQuote.execute({ tickers, date });
  }
}
