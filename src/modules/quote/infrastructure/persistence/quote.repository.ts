import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { QuoteRepositoryPort } from '@/modules/quote/application/ports/quote-repository.port';
import { HistoricalQuote } from '@/modules/quote/domain/historical-quote.entity';
import { QuoteMapper } from '@/modules/quote/infrastructure/persistence/mappers/quote.mapper';

@Injectable()
export class QuoteRepository implements QuoteRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(quote: HistoricalQuote): Promise<void> {
    const price = quote.closingPrice.amount;
    await this.prisma.quote.upsert({
      where: { date_code: { date: quote.date, code: quote.ticker } },
      update: { closingPrice: price },
      create: {
        id: quote.id,
        code: quote.ticker,
        date: quote.date,
        closingPrice: price,
        openingPrice: price,
        maxPrice: price,
        minPrice: price,
      },
    });
  }

  async saveMany(quotes: HistoricalQuote[]): Promise<void> {
    await this.prisma.quote.createMany({
      data: quotes.map((q) => {
        const price = q.closingPrice.amount;
        return {
          id: q.id,
          code: q.ticker,
          date: q.date,
          closingPrice: price,
          openingPrice: price,
          maxPrice: price,
          minPrice: price,
        };
      }),
      skipDuplicates: true,
    });
  }

  async findByTickersAndDate(
    tickers: string[],
    date?: Date,
  ): Promise<HistoricalQuote[]> {
    const targetDate = date ?? new Date();

    const records = await this.prisma.quote.findMany({
      where: { code: { in: tickers }, date: targetDate },
    });

    return records.map((r) => QuoteMapper.toDomain(r));
  }
}
