import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { QuoteRepositoryPort } from '@/modules/quote/application/ports/quote-repository.port';
import { HistoricalQuote } from '@/modules/quote/domain/historical-quote.entity';
import { QuoteMapper } from '@/modules/quote/infrastructure/persistence/mappers/quote.mapper';

@Injectable()
export class QuoteRepository implements QuoteRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(quote: HistoricalQuote): Promise<void> {
    await this.prisma.quote.upsert({
      where: { date_code: { date: quote.date, code: quote.ticker } },
      update: { closingPrice: quote.closingPrice },
      create: {
        id: quote.id,
        code: quote.ticker,
        date: quote.date,
        closingPrice: quote.closingPrice,
        openingPrice: quote.closingPrice,
        maxPrice: quote.closingPrice,
        minPrice: quote.closingPrice,
      },
    });
  }

  async saveMany(quotes: HistoricalQuote[]): Promise<void> {
    await this.prisma.quote.createMany({
      data: quotes.map((q) => ({
        id: q.id,
        code: q.ticker,
        date: q.date,
        closingPrice: q.closingPrice,
        openingPrice: q.closingPrice,
        maxPrice: q.closingPrice,
        minPrice: q.closingPrice,
      })),
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
