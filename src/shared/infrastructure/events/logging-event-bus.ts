import { Injectable, Logger } from '@nestjs/common';
import { EventBusPort } from '@/shared/events/event-bus.interface';
import { DomainEvent } from '@/shared/events/domain-event.interface';

@Injectable()
export class LoggingEventBus implements EventBusPort {
  private readonly logger = new Logger(LoggingEventBus.name);

  async publish(event: DomainEvent): Promise<void> {
    await Promise.resolve(() =>
      this.logger.log(
        `[DomainEvent] ${event.constructor.name} ${JSON.stringify(event)}`,
      ),
    );
  }
}
