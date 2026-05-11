import { Money } from '@/shared/domain/money.vo';
import { DomainEvent } from '@/shared/events/domain-event.interface';

export class PurchaseExecutedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly masterAccountId: string,
    readonly totalPurchase: Money,
  ) {
    this.occurredAt = new Date();
  }
}
