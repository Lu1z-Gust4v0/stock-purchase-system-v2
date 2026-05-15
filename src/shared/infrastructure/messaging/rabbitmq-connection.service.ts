import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqplib from 'amqplib';

const DLX = 'stock-purchase.dlx';
export const DLQ = 'stock-purchase.events.dlq';

@Injectable()
export class RabbitMQTopologyService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQTopologyService.name);

  async onModuleInit(): Promise<void> {
    const url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
    const connection = await amqplib.connect(url);
    const channel = await connection.createChannel();

    await channel.assertExchange(DLX, 'fanout', { durable: true });
    await channel.assertQueue(DLQ, { durable: true });
    await channel.bindQueue(DLQ, DLX, '#');

    await channel.close();
    await connection.close();

    this.logger.log('RabbitMQ DLQ topology asserted');
  }
}
