import { Entity } from '@/shared/kernel/entity';
import { DomainError } from '@/shared/errors/domain.exception';

export class AssetPosition extends Entity<string> {
  private readonly _ticker: string;
  private _quantity: number;
  private _averagePrice: number;

  private constructor(
    id: string,
    ticker: string,
    quantity: number,
    averagePrice: number,
  ) {
    super(id);
    this._ticker = ticker;
    this._quantity = quantity;
    this._averagePrice = averagePrice;
  }

  get ticker(): string {
    return this._ticker;
  }
  get quantity(): number {
    return this._quantity;
  }
  get averagePrice(): number {
    return this._averagePrice;
  }
  get totalValue(): number {
    return this._quantity * this._averagePrice;
  }

  static create(
    id: string,
    ticker: string,
    quantity: number,
    averagePrice: number,
  ): AssetPosition {
    return new AssetPosition(id, ticker, quantity, averagePrice);
  }

  static reconstitute(
    id: string,
    ticker: string,
    quantity: number,
    averagePrice: number,
  ): AssetPosition {
    return new AssetPosition(id, ticker, quantity, averagePrice);
  }

  addShares(quantity: number, price: number): void {
    const totalCost = this._quantity * this._averagePrice + quantity * price;
    this._quantity += quantity;
    this._averagePrice = totalCost / this._quantity;
  }

  removeShares(quantity: number): void {
    if (quantity > this._quantity) {
      throw new DomainError(
        `Cannot remove ${quantity} shares from ${this._ticker}: only ${this._quantity} available`,
      );
    }
    this._quantity -= quantity;
  }
}
