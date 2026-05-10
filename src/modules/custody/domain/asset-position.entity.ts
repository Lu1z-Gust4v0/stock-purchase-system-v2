import { randomUUID } from 'node:crypto';
import { Entity } from '@/shared/kernel/entity';
import { DomainError } from '@/shared/errors/domain.exception';
import { Money } from '@/shared/domain/money.vo';

export class AssetPosition extends Entity<string> {
  private readonly _ticker: string;
  private _quantity: number;
  private _averagePrice: Money;

  private constructor(
    id: string,
    ticker: string,
    quantity: number,
    averagePrice: Money,
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
  get averagePrice(): Money {
    return this._averagePrice;
  }
  get totalValue(): Money {
    return this._averagePrice.multiply(this._quantity);
  }

  static create(
    ticker: string,
    quantity: number,
    averagePrice: Money,
  ): AssetPosition {
    return new AssetPosition(randomUUID(), ticker, quantity, averagePrice);
  }

  static reconstitute(
    id: string,
    ticker: string,
    quantity: number,
    averagePrice: Money,
  ): AssetPosition {
    return new AssetPosition(id, ticker, quantity, averagePrice);
  }

  addShares(quantity: number, price: Money): void {
    const totalCost = this._averagePrice
      .multiply(this._quantity)
      .add(price.multiply(quantity));

    this._quantity += quantity;
    this._averagePrice = totalCost.divide(this._quantity);
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
