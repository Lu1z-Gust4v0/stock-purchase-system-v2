import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Admin, Kafka, Producer } from 'kafkajs';
import type { TaxEventPublisherPort } from '@/modules/tax/application/ports/tax-event-publisher.port';
import type { WithholdingTaxEventDto } from '@/modules/tax/application/dtos/withholding-tax-event.dto';
import type { SaleTaxEventDto } from '@/modules/tax/application/dtos/sale-tax-event.dto';

const WITHHOLDING_TAX_TOPIC = 'tax-withholding-events';
const SALE_TAX_TOPIC = 'tax-sale-events';

@Injectable()
export class KafkaTaxEventPublisher
  implements TaxEventPublisherPort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaTaxEventPublisher.name);

  private readonly producer: Producer;
  private readonly admin: Admin;

  constructor() {
    const kafka = new Kafka({
      clientId: 'tax-module',
      brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
    });
    this.producer = kafka.producer();
    this.admin = kafka.admin();
  }

  async onModuleInit(): Promise<void> {
    await this.admin.connect();
    await this.admin.createTopics({
      waitForLeaders: true,
      topics: [
        { topic: WITHHOLDING_TAX_TOPIC },
        { topic: SALE_TAX_TOPIC },
      ],
    });
    await this.admin.disconnect();
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  publishWithholdingTax(event: WithholdingTaxEventDto): void {
    this.producer
      .send({
        topic: WITHHOLDING_TAX_TOPIC,
        messages: [{ value: JSON.stringify(event) }],
      })
      .catch((err) => this.logger.error('Failed to publish tax event', err));
  }

  publishSaleTax(event: SaleTaxEventDto): void {
    this.producer
      .send({
        topic: SALE_TAX_TOPIC,
        messages: [{ value: JSON.stringify(event) }],
      })
      .catch((err) => this.logger.error('Failed to publish tax event', err));
  }
}
