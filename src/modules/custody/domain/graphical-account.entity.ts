import { randomUUID } from 'node:crypto';
import { Entity } from '@/shared/kernel/entity';

export enum AccountType {
  MASTER = 'MASTER',
  CHILD = 'CHILD',
}

export class GraphicalAccount extends Entity<string> {
  private readonly _clientId: string;
  private readonly _account: string;
  private readonly _type: AccountType;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    clientId: string,
    account: string,
    type: AccountType,
    createdAt: Date,
  ) {
    super(id);
    this._clientId = clientId;
    this._account = account;
    this._type = type;
    this._createdAt = createdAt;
  }

  get clientId(): string {
    return this._clientId;
  }
  get account(): string {
    return this._account;
  }
  get type(): AccountType {
    return this._type;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  static create(
    clientId: string,
    account: string,
    type: AccountType,
  ): GraphicalAccount {
    return new GraphicalAccount(
      randomUUID(),
      clientId,
      account,
      type,
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    clientId: string,
    account: string,
    type: AccountType,
    createdAt: Date,
  ): GraphicalAccount {
    return new GraphicalAccount(id, clientId, account, type, createdAt);
  }
}
