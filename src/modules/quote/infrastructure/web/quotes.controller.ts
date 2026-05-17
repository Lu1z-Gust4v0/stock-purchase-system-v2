import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetQuoteUseCase } from '@/modules/quote/application/use-cases/get-quote.use-case';
import { QuoteResponse, QuoteResponseMapper } from './responses/quote.response';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly getQuote: GetQuoteUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get closing quotes for one or more tickers' })
  @ApiQuery({
    name: 'tickers',
    description: 'Comma-separated ticker symbols',
    example: 'PETR4,VALE3',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Reference date (ISO 8601). Defaults to today.',
    example: '2024-01-15',
  })
  @ApiResponse({ status: 200, type: [QuoteResponse] })
  async getByTickers(
    @Query('tickers') tickersParam: string,
    @Query('date') dateStr?: string,
  ): Promise<QuoteResponse[]> {
    const tickers = tickersParam.split(',').map((t) => t.trim().toUpperCase());
    const date = dateStr ? new Date(dateStr) : new Date();
    const result = await this.getQuote.execute({ tickers, date });
    return QuoteResponseMapper.toResponseList(result);
  }
}
