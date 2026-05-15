import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from './config/filters/http-exception-filter';
import { PrismaExceptionFilter } from './config/filters/prisma-exception-filter';
import { RmqExceptionFilter } from './shared/infrastructure/messaging/rmq-exception.filter';

const QUEUE = 'stock-purchase.events';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: QUEUE,
      queueOptions: {
        durable: true,
        arguments: { 'x-dead-letter-exchange': 'stock-purchase.dlx' },
      },
      noAck: false,
      prefetchCount: 1,
    },
  });

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
    new RmqExceptionFilter(),
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
