import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';
import { CustodyModule } from '@/modules/custody/custody.module';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryPort,
} from './application/ports/customer-repository.port';
import { CustomerRepository } from './infrastructure/persistence/prisma/customer.repository';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.usecase';
import { DisableCustomerUseCase } from './application/use-cases/disable-customer.usecase';
import { UpdateCustomerDepositUseCase } from './application/use-cases/update-customer-deposit.usecase';
import { CUSTOMER_API } from './api/customer-api.interface';
import { CustomerApi } from './api/customer.api';
import { CustomerController } from './infrastructure/web/customer.controller';
import {
  CUSTODY_API,
  CustodyApiInterface,
} from '@/modules/custody/api/custody-api.interface';

@Module({
  imports: [PrismaModule, CustodyModule],
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
      provide: CUSTOMER_API,
      useFactory: (
        create: CreateCustomerUseCase,
        disable: DisableCustomerUseCase,
        updateDeposit: UpdateCustomerDepositUseCase,
        repo: CustomerRepositoryPort,
      ) => new CustomerApi(create, disable, updateDeposit, repo),
      inject: [
        CreateCustomerUseCase,
        DisableCustomerUseCase,
        UpdateCustomerDepositUseCase,
        CUSTOMER_REPOSITORY,
      ],
    },
  ],
  exports: [CUSTOMER_API],
})
export class CustomerModule {}
