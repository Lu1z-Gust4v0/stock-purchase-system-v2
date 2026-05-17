import { v7 as uuidv7 } from 'uuid';
import { Money } from '@/shared/domain/money.vo';
import { Entity } from '@/shared/kernel/entity';

export enum MarketType {
  SPOT = 'SPOT', // LOTE
  FRACTIONAL = 'FRACTIONAL', // FRACIONARIO
}

export interface OrderItem {
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
  marketType: MarketType;
}

export class Order extends Entity<string> {
  private readonly _brokerageAccountId: string;
  private readonly _items: OrderItem[];
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    brokerageAccountId: string,
    items: OrderItem[],
    createdAt: Date,
  ) {
    super(id);
    this._brokerageAccountId = brokerageAccountId;
    this._items = items;
    this._createdAt = createdAt;
  }

  get brokerageAccountId(): string {
    return this._brokerageAccountId;
  }

  get items(): OrderItem[] {
    return this._items;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  static create(brokerageAccountId: string, items: OrderItem[]): Order {
    return new Order(uuidv7(), brokerageAccountId, items, new Date());
  }

  static reconstitute(
    id: string,
    brokerageAccountId: string,
    items: OrderItem[],
    createdAt: Date,
  ): Order {
    return new Order(id, brokerageAccountId, items, createdAt);
  }
}
