import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EVENT_BUS_PORT } from '@/shared/events/event-bus.interface';
import {
  RABBITMQ_CLIENT,
  RabbitMQEventBus,
} from '../messaging/rabbitmq-event-bus';
import { RabbitMQTopologyService } from '../messaging/rabbitmq-connection.service';

const QUEUE = 'stock-purchase.events';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: RABBITMQ_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: QUEUE,
          queueOptions: {
            durable: true,
            arguments: { 'x-dead-letter-exchange': 'stock-purchase.dlx' },
          },
        },
      },
    ]),
  ],
  providers: [
    RabbitMQTopologyService,
    RabbitMQEventBus,
    {
      provide: EVENT_BUS_PORT,
      useExisting: RabbitMQEventBus,
    },
  ],
  exports: [EVENT_BUS_PORT],
})
export class EventBusModule {}
