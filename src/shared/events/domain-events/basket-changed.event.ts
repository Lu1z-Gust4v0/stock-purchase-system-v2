import { DomainEvent } from '../domain-event.interface';

export class BasketChangedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(readonly basketId: string) {
    this.occurredAt = new Date();
  }
}
