import { Entity } from '../../shared/kernel/entity';

export interface DistributionItem {
  ticker: string;
  quantity: number;
  averagePrice: number;
}

export class Distribution extends Entity<string> {
  private readonly _purchaseOrderId: string;
  private readonly _customerId: string;
  private readonly _items: DistributionItem[];
  private readonly _distributedAt: Date;

  private constructor(
    id: string,
    purchaseOrderId: string,
    customerId: string,
    items: DistributionItem[],
    distributedAt: Date,
  ) {
    super(id);
    this._purchaseOrderId = purchaseOrderId;
    this._customerId = customerId;
    this._items = items;
    this._distributedAt = distributedAt;
  }

  get purchaseOrderId(): string {
    return this._purchaseOrderId;
  }
  get customerId(): string {
    return this._customerId;
  }
  get items(): DistributionItem[] {
    return [...this._items];
  }
  get distributedAt(): Date {
    return this._distributedAt;
  }

  static create(
    id: string,
    purchaseOrderId: string,
    customerId: string,
    items: DistributionItem[],
  ): Distribution {
    return new Distribution(id, purchaseOrderId, customerId, items, new Date());
  }

  static reconstitute(
    id: string,
    purchaseOrderId: string,
    customerId: string,
    items: DistributionItem[],
    distributedAt: Date,
  ): Distribution {
    return new Distribution(
      id,
      purchaseOrderId,
      customerId,
      items,
      distributedAt,
    );
  }
}
