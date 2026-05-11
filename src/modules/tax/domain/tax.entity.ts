import { Money } from '@/shared/domain/money.vo';
import { Entity } from '@/shared/kernel/entity';
import { randomUUID } from 'node:crypto';

export enum TaxType {
  SALE = 'SALE',
  REGULATORY = 'REGULATORY',
}

export class Tax extends Entity<string> {
  private readonly _type: TaxType;
  private readonly _baseAmount: Money;
  private readonly _amount: Money;
  private _published: boolean;
  private readonly _graphicalAccountId: string;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    type: TaxType,
    baseAmount: Money,
    amount: Money,
    published: boolean,
    graphicalAccountId: string,
    createdAt: Date,
  ) {
    super(id);
    this._type = type;
    this._baseAmount = baseAmount;
    this._amount = amount;
    this._published = published;
    this._graphicalAccountId = graphicalAccountId;
    this._createdAt = createdAt;
  }

  get type(): TaxType {
    return this._type;
  }

  get baseAmount(): Money {
    return this._baseAmount;
  }

  get amount(): Money {
    return this._amount;
  }

  get published(): boolean {
    return this._published;
  }

  get graphicalAccountId(): string {
    return this._graphicalAccountId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  static create(
    type: TaxType,
    baseAmount: Money,
    amount: Money,
    graphicalAccountId: string,
  ): Tax {
    return new Tax(
      randomUUID(),
      type,
      baseAmount,
      amount,
      false,
      graphicalAccountId,
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    type: TaxType,
    baseAmount: Money,
    amount: Money,
    published: boolean,
    graphicalAccountId: string,
    createdAt: Date,
  ): Tax {
    return new Tax(
      id,
      type,
      baseAmount,
      amount,
      published,
      graphicalAccountId,
      createdAt,
    );
  }

  markAsPublished(): void {
    this._published = true;
  }
}
