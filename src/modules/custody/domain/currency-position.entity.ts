import { randomUUID } from 'node:crypto';
import { Money } from '@/shared/domain/money.vo';
import { Entity } from '@/shared/kernel/entity';

export enum CurrencyCode {
  BRL = 'BRL',
}

export class CurrencyPosition extends Entity<string> {
  private readonly _code: CurrencyCode;
  private readonly _graphicalAccountId: string;
  private _amount: Money;
  private _updatedAt?: Date;

  private constructor(
    id: string,
    graphicalAccountId: string,
    amount: Money,
    code: CurrencyCode = CurrencyCode.BRL,
  ) {
    super(id);
    this._graphicalAccountId = graphicalAccountId;
    this._amount = amount;
    this._code = code;
  }

  get code(): CurrencyCode {
    return this._code;
  }
  get graphicalAccountId(): string {
    return this._graphicalAccountId;
  }
  get amount(): Money {
    return this._amount;
  }
  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  static create(
    graphicalAccountId: string,
    amount: Money,
    code: CurrencyCode = CurrencyCode.BRL,
  ): CurrencyPosition {
    return new CurrencyPosition(randomUUID(), graphicalAccountId, amount, code);
  }

  static reconstitute(
    id: string,
    graphicalAccountId: string,
    amount: Money,
    code: CurrencyCode = CurrencyCode.BRL,
  ): CurrencyPosition {
    return new CurrencyPosition(id, graphicalAccountId, amount, code);
  }

  add(amount: Money) {
    this._amount = this._amount.add(amount);
    this._updatedAt = new Date();
  }

  subtract(amount: Money) {
    this._amount = this._amount.subtract(amount);
    this._updatedAt = new Date();
  }
}
