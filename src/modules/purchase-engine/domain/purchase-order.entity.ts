import { AggregateRoot } from '@/shared/kernel/aggregate-root';
import { PurchaseExecutedEvent } from '@/shared/events/domain-events/purchase-executed.event';
import { Money } from '@/shared/domain/money.vo';

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
  FAILED = 'FAILED',
}

export interface PurchaseOrderItem {
  ticker: string;
  standardLotQuantity: number;
  fractionalQuantity: number;
  price: Money;
  totalCost: Money;
}

export class PurchaseOrder extends AggregateRoot<string> {
  private readonly _executionDate: Date;
  private readonly _totalAmount: Money;
  private readonly _items: PurchaseOrderItem[];
  private _status: PurchaseOrderStatus;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    executionDate: Date,
    totalAmount: Money,
    items: PurchaseOrderItem[],
    status: PurchaseOrderStatus,
    createdAt: Date,
  ) {
    super(id);
    this._executionDate = executionDate;
    this._totalAmount = totalAmount;
    this._items = items;
    this._status = status;
    this._createdAt = createdAt;
  }

  get executionDate(): Date {
    return this._executionDate;
  }
  get totalAmount(): Money {
    return this._totalAmount;
  }
  get items(): PurchaseOrderItem[] {
    return [...this._items];
  }
  get status(): PurchaseOrderStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  static create(
    id: string,
    executionDate: Date,
    totalAmount: Money,
    items: PurchaseOrderItem[],
  ): PurchaseOrder {
    return new PurchaseOrder(
      id,
      executionDate,
      totalAmount,
      items,
      PurchaseOrderStatus.PENDING,
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    executionDate: Date,
    totalAmount: Money,
    items: PurchaseOrderItem[],
    status: PurchaseOrderStatus,
    createdAt: Date,
  ): PurchaseOrder {
    return new PurchaseOrder(
      id,
      executionDate,
      totalAmount,
      items,
      status,
      createdAt,
    );
  }

  markExecuted(): void {
    this._status = PurchaseOrderStatus.EXECUTED;
    this.addDomainEvent(new PurchaseExecutedEvent(this._id));
  }

  markFailed(): void {
    this._status = PurchaseOrderStatus.FAILED;
  }
}
