import { Global, Module } from '@nestjs/common';
import { EVENT_BUS_PORT } from '@/shared/events/event-bus.interface';
import { LoggingEventBus } from '@/shared/infrastructure/events/logging-event-bus';

@Global()
@Module({
  providers: [
    {
      provide: EVENT_BUS_PORT,
      useClass: LoggingEventBus,
    },
  ],
  exports: [EVENT_BUS_PORT],
})
export class EventBusModule {}
