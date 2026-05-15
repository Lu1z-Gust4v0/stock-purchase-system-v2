import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventBusPort } from '@/shared/events/event-bus.interface';
import { DomainEvent } from '@/shared/events/domain-event.interface';

export const RABBITMQ_CLIENT = Symbol('RABBITMQ_CLIENT');

@Injectable()
export class RabbitMQEventBus implements EventBusPort {
  constructor(@Inject(RABBITMQ_CLIENT) private readonly client: ClientProxy) {}

  publish(event: DomainEvent): void {
    const routingKey = event.constructor.name;
    const payload = event.toJSON();
    this.client.emit(routingKey, payload);
  }
}
