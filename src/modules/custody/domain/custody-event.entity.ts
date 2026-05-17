import { v7 as uuidv7 } from 'uuid';
import { Entity } from '@/shared/kernel/entity';
import { Money } from '@/shared/domain/money.vo';

export enum CustodyEventType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  DISTRIBUTION = 'DISTRIBUTION',
}

export interface CustodyEventProps {
  graphicalAccountId: string;
  type: CustodyEventType;
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
  profit: Money;
  createdAt: Date;
}

export class CustodyEvent extends Entity<string> {
  private readonly _graphicalAccountId: string;
  private readonly _type: CustodyEventType;
  private readonly _ticker: string;
  private readonly _quantity: number;
  private readonly _unitaryPrice: Money;
  private readonly _profit: Money;
  private readonly _createdAt: Date;

  private constructor(id: string, props: CustodyEventProps) {
    super(id);
    this._graphicalAccountId = props.graphicalAccountId;
    this._type = props.type;
    this._ticker = props.ticker;
    this._quantity = props.quantity;
    this._unitaryPrice = props.unitaryPrice;
    this._profit = props.profit;
    this._createdAt = props.createdAt;
  }

  get graphicalAccountId(): string {
    return this._graphicalAccountId;
  }
  get type(): CustodyEventType {
    return this._type;
  }
  get ticker(): string {
    return this._ticker;
  }
  get quantity(): number {
    return this._quantity;
  }
  get unitaryPrice(): Money {
    return this._unitaryPrice;
  }
  get profit(): Money {
    return this._profit;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  static create(props: Omit<CustodyEventProps, 'createdAt'>): CustodyEvent {
    return new CustodyEvent(uuidv7(), { ...props, createdAt: new Date() });
  }

  static reconstitute(id: string, props: CustodyEventProps): CustodyEvent {
    return new CustodyEvent(id, props);
  }
}
