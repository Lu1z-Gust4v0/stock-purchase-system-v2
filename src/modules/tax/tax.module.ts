import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';
import { CustodyModule } from '@/modules/custody/custody.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { CUSTODY_API } from '@/modules/custody/api/custody-api.interface';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import {
  TAX_REPOSITORY,
  TaxRepositoryPort,
} from './application/ports/tax-repository.port';
import {
  TAX_EVENT_PUBLISHER,
  TaxEventPublisherPort,
} from './application/ports/tax-event-publisher.port';
import { TaxRepository } from './infrastructure/persistence/prisma/tax.repository';
import { KafkaTaxEventPublisher } from './infrastructure/messaging/kafka-tax-event.publisher';
import { CalculateRegulatoryTaxUseCase } from './application/use-cases/calculate-regulatory-tax.usecase';
import { CalculateSalesTaxUseCase } from './application/use-cases/calculate-sales-tax.usecase';
import { PublishTaxUseCase } from './application/use-cases/publish-tax.usecase';
import { TAX_API } from './api/tax-api.interface';
import { TaxApi } from './api/tax.api';
import { CustomerTaxesPublisherJob } from './infrastructure/jobs/customer-taxes-publisher.job';

@Module({
  imports: [PrismaModule, CustodyModule, CustomerModule],
  controllers: [CustomerTaxesPublisherJob],
  providers: [
    {
      provide: TAX_REPOSITORY,
      useClass: TaxRepository,
    },
    {
      provide: TAX_EVENT_PUBLISHER,
      useClass: KafkaTaxEventPublisher,
    },
    {
      provide: CalculateRegulatoryTaxUseCase,
      useFactory: () => new CalculateRegulatoryTaxUseCase(),
    },
    {
      provide: CalculateSalesTaxUseCase,
      useFactory: (custodyApi: CustodyApiInterface) =>
        new CalculateSalesTaxUseCase(custodyApi),
      inject: [CUSTODY_API],
    },
    {
      provide: PublishTaxUseCase,
      useFactory: (
        publisher: TaxEventPublisherPort,
        taxRepo: TaxRepositoryPort,
      ) => new PublishTaxUseCase(publisher, taxRepo),
      inject: [TAX_EVENT_PUBLISHER, TAX_REPOSITORY],
    },
    {
      provide: TAX_API,
      useFactory: (
        calculateSalesTax: CalculateSalesTaxUseCase,
        calculateRegulatoryTax: CalculateRegulatoryTaxUseCase,
        publishTax: PublishTaxUseCase,
      ) => new TaxApi(calculateSalesTax, calculateRegulatoryTax, publishTax),
      inject: [
        CalculateSalesTaxUseCase,
        CalculateRegulatoryTaxUseCase,
        PublishTaxUseCase,
      ],
    },
  ],
  exports: [TAX_API],
})
export class TaxModule {}
