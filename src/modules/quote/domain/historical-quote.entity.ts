import { Entity } from '@/shared/kernel/entity';

export class HistoricalQuote extends Entity<string> {
  private readonly _ticker: string;
  private readonly _date: Date;
  private readonly _closingPrice: number;

  private constructor(
    id: string,
    ticker: string,
    date: Date,
    closingPrice: number,
  ) {
    super(id);
    this._ticker = ticker;
    this._date = date;
    this._closingPrice = closingPrice;
  }

  get ticker(): string {
    return this._ticker;
  }
  get date(): Date {
    return this._date;
  }
  get closingPrice(): number {
    return this._closingPrice;
  }

  static create(
    id: string,
    ticker: string,
    date: Date,
    closingPrice: number,
  ): HistoricalQuote {
    return new HistoricalQuote(id, ticker, date, closingPrice);
  }
}
