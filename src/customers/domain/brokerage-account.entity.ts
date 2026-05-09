import { Entity } from '../../shared/kernel/entity';

export class BrokerageAccount extends Entity<string> {
  private readonly _customerId: string;
  private readonly _externalAccountId: string;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    customerId: string,
    externalAccountId: string,
    createdAt: Date,
  ) {
    super(id);
    this._customerId = customerId;
    this._externalAccountId = externalAccountId;
    this._createdAt = createdAt;
  }

  get customerId(): string {
    return this._customerId;
  }
  get externalAccountId(): string {
    return this._externalAccountId;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  static create(
    id: string,
    customerId: string,
    externalAccountId: string,
  ): BrokerageAccount {
    return new BrokerageAccount(id, customerId, externalAccountId, new Date());
  }

  static reconstitute(
    id: string,
    customerId: string,
    externalAccountId: string,
    createdAt: Date,
  ): BrokerageAccount {
    return new BrokerageAccount(id, customerId, externalAccountId, createdAt);
  }
}
