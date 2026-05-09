import { DomainEvent } from '../domain-event.interface';

export class PurchaseExecutedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(readonly purchaseOrderId: string) {
    this.occurredAt = new Date();
  }
}
