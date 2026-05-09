import { Injectable } from '@nestjs/common';
import { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import { GetQuoteUseCase } from '@/modules/quote/application/use-cases/get-quote.use-case';
import { QuoteResponseDto } from '@/modules/quote/application/dtos/quote-response.dto';

@Injectable()
export class QuotesApi implements QuotesApiInterface {
  constructor(private readonly getQuote: GetQuoteUseCase) {}

  async getQuotes(tickers: string[], date?: Date): Promise<QuoteResponseDto[]> {
    return this.getQuote.execute({ tickers, date });
  }
}
