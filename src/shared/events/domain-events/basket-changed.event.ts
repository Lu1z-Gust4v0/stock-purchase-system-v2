import { DomainEvent } from '@/shared/events/domain-event.interface';

export interface BasketChangedEventPayload {
  basketId: string;
  occurredAt: Date;
}

export class BasketChangedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(readonly basketId: string) {
    this.occurredAt = new Date();
  }

  toJSON(): BasketChangedEventPayload {
    return { basketId: this.basketId, occurredAt: this.occurredAt };
  }

  static fromJSON(data: BasketChangedEventPayload): BasketChangedEvent {
    const event = new BasketChangedEvent(data.basketId);
    return event;
  }
}
