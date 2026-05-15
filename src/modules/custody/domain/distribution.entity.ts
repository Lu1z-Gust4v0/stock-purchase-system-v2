import { Money } from '@/shared/domain/money.vo';
import { Entity } from '@/shared/kernel/entity';
import { randomUUID } from 'node:crypto';

export interface DistributionItem {
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
}

export class Distribution extends Entity<string> {
  private readonly _amount: Money;
  private readonly _origin: string;
  private readonly _destination: string;
  private readonly _createdAt: Date;
  private readonly _items: DistributionItem[];

  private constructor(
    id: string,
    amount: Money,
    origin: string,
    destination: string,
    items: DistributionItem[],
    createdAt: Date,
  ) {
    super(id);
    this._amount = amount;
    this._origin = origin;
    this._destination = destination;
    this._items = items;
    this._createdAt = createdAt;
  }

  get amount(): Money {
    return this._amount;
  }
  get origin(): string {
    return this._origin;
  }
  get destination(): string {
    return this._destination;
  }
  get items(): DistributionItem[] {
    return this._items;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  static create(
    amount: Money,
    origin: string,
    destination: string,
    items: DistributionItem[],
  ): Distribution {
    return new Distribution(
      randomUUID(),
      amount,
      origin,
      destination,
      items,
      new Date(),
    );
  }
}
