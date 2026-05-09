import { DomainEvent } from '@/shared/events/domain-event.interface';

export const EVENT_BUS_PORT = Symbol('EVENT_BUS_PORT');

export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>;
}
