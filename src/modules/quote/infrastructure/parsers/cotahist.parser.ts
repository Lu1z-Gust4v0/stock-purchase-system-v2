import * as fs from 'node:fs';
import * as readline from 'node:readline';
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { QuoteHistoryParserPort } from '@/modules/quote/application/ports/quote-history-parser.port';
import {
  HistoricalQuote,
  MarketType,
} from '@/modules/quote/domain/historical-quote.entity';

const ALLOWED_BDI = new Set(['02', '96']);

const TPMERC_TO_MARKET_TYPE: Record<string, MarketType> = {
  '010': MarketType.SPOT,
  '020': MarketType.FRACTIONAL,
};

@Injectable()
export class QuoteHistoryParser implements QuoteHistoryParserPort {
  async parse(filePath: string): Promise<HistoricalQuote[]> {
    const quotes: HistoricalQuote[] = [];

    const fileStream = fs.createReadStream(filePath, { encoding: 'latin1' });
    const reader = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of reader) {
      if (line.length < 245) continue;
      if (line.substring(0, 2) !== '01') continue;

      const bdi = line.substring(10, 12);
      if (!ALLOWED_BDI.has(bdi)) continue;

      const tpmerc = line.substring(24, 27);
      const marketType = TPMERC_TO_MARKET_TYPE[tpmerc];
      if (!marketType) continue;

      const ticker = line.substring(12, 24).trim();
      const datpre = line.substring(2, 10);
      const date = new Date(
        `${datpre.substring(0, 4)}-${datpre.substring(4, 6)}-${datpre.substring(6, 8)}`,
      );
      const closingPrice = this.parsePrice(line.substring(108, 121));

      quotes.push(
        HistoricalQuote.create(
          randomUUID(),
          ticker,
          date,
          closingPrice,
          marketType,
        ),
      );
    }

    return quotes;
  }

  // Prices in COTAHIST are integers with 2 implicit decimal places (e.g. 3850 = R$ 38.50)
  private parsePrice(raw: string): number {
    const value = Number.parseInt(raw.trim(), 10);
    return Number.isNaN(value) ? 0 : value / 100;
  }
}
