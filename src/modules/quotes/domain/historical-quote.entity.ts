import { Entity } from '@/shared/kernel/entity';

export enum MarketType {
  SPOT = 'SPOT',
  FRACTIONAL = 'FRACTIONAL',
  OPTIONS = 'OPTIONS',
}

export class HistoricalQuote extends Entity<string> {
  private readonly _ticker: string;
  private readonly _date: Date;
  private readonly _closingPrice: number;
  private readonly _marketType: MarketType;

  private constructor(
    id: string,
    ticker: string,
    date: Date,
    closingPrice: number,
    marketType: MarketType,
  ) {
    super(id);
    this._ticker = ticker;
    this._date = date;
    this._closingPrice = closingPrice;
    this._marketType = marketType;
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
  get marketType(): MarketType {
    return this._marketType;
  }

  static create(
    id: string,
    ticker: string,
    date: Date,
    closingPrice: number,
    marketType: MarketType,
  ): HistoricalQuote {
    return new HistoricalQuote(id, ticker, date, closingPrice, marketType);
  }
}
