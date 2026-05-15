import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';
import { CustodyModule } from '@/modules/custody/custody.module';
import { QuoteModule } from '@/modules/quote/quote.module';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryPort,
} from './application/ports/customer-repository.port';
import { CustomerRepository } from './infrastructure/persistence/prisma/customer.repository';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.usecase';
import { DisableCustomerUseCase } from './application/use-cases/disable-customer.usecase';
import { UpdateCustomerDepositUseCase } from './application/use-cases/update-customer-deposit.usecase';
import { GetCustomerPortfolioUseCase } from './application/use-cases/get-customer-portfolio.usecase';
import { PortfolioSummaryCalculator } from './domain/services/portfolio-summary-calculator.service';
import { CUSTOMER_API } from './api/customer-api.interface';
import { CustomerApi } from './api/customer.api';
import { CustomerController } from './infrastructure/web/customer.controller';
import {
  CUSTODY_API,
  CustodyApiInterface,
} from '@/modules/custody/api/custody-api.interface';
import {
  QUOTES_API,
  QuotesApiInterface,
} from '@/modules/quote/api/quotes-api.interface';

@Module({
  imports: [PrismaModule, CustodyModule, QuoteModule],
  controllers: [CustomerController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
    {
      provide: CreateCustomerUseCase,
      useFactory: (
        repo: CustomerRepositoryPort,
        custodyApi: CustodyApiInterface,
      ) => new CreateCustomerUseCase(repo, custodyApi),
      inject: [CUSTOMER_REPOSITORY, CUSTODY_API],
    },
    {
      provide: DisableCustomerUseCase,
      useFactory: (repo: CustomerRepositoryPort) =>
        new DisableCustomerUseCase(repo),
      inject: [CUSTOMER_REPOSITORY],
    },
    {
      provide: UpdateCustomerDepositUseCase,
      useFactory: (repo: CustomerRepositoryPort) =>
        new UpdateCustomerDepositUseCase(repo),
      inject: [CUSTOMER_REPOSITORY],
    },
    {
      provide: PortfolioSummaryCalculator,
      useFactory: (
        quotesApi: QuotesApiInterface,
        custodyApi: CustodyApiInterface,
      ) => new PortfolioSummaryCalculator(quotesApi, custodyApi),
      inject: [QUOTES_API, CUSTODY_API],
    },
    {
      provide: GetCustomerPortfolioUseCase,
      useFactory: (
        repo: CustomerRepositoryPort,
        custodyApi: CustodyApiInterface,
        calculator: PortfolioSummaryCalculator,
      ) => new GetCustomerPortfolioUseCase(repo, custodyApi, calculator),
      inject: [CUSTOMER_REPOSITORY, CUSTODY_API, PortfolioSummaryCalculator],
    },
    {
      provide: CUSTOMER_API,
      useFactory: (
        create: CreateCustomerUseCase,
        disable: DisableCustomerUseCase,
        updateDeposit: UpdateCustomerDepositUseCase,
        getPortfolio: GetCustomerPortfolioUseCase,
        repo: CustomerRepositoryPort,
      ) => new CustomerApi(create, disable, updateDeposit, getPortfolio, repo),
      inject: [
        CreateCustomerUseCase,
        DisableCustomerUseCase,
        UpdateCustomerDepositUseCase,
        GetCustomerPortfolioUseCase,
        CUSTOMER_REPOSITORY,
      ],
    },
  ],
  exports: [CUSTOMER_API],
})
export class CustomerModule {}
