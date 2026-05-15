import { Currency, Money } from '@/shared/domain/money.vo';
import { DomainEvent } from '@/shared/events/domain-event.interface';

interface PurchaseExecutedPayload {
  masterAccountId: string;
  totalPurchase: { amount: number; currency: string };
  occurredAt: Date;
}

export class PurchaseExecutedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly masterAccountId: string,
    readonly totalPurchase: Money,
  ) {
    this.occurredAt = new Date();
  }

  toJSON(): PurchaseExecutedPayload {
    return {
      masterAccountId: this.masterAccountId,
      totalPurchase: this.totalPurchase.toJSON(),
      occurredAt: this.occurredAt,
    };
  }

  static fromJSON(data: PurchaseExecutedPayload): PurchaseExecutedEvent {
    return new PurchaseExecutedEvent(
      data.masterAccountId,
      Money.fromNumber(
        data.totalPurchase.amount,
        data.totalPurchase.currency as Currency,
      ),
    );
  }
}
