import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from './config/filters/http-exception-filter';
import { PrismaExceptionFilter } from './config/filters/prisma-exception-filter';
const QUEUE = 'stock-purchase.events';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Stock Purchase API')
    .setDescription(
      'API for managing stock purchases, baskets, and customer portfolios',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

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

  app.useGlobalFilters(new PrismaExceptionFilter(), new HttpExceptionFilter());

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
