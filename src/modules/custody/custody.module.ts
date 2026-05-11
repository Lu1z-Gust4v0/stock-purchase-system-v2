import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';
import {
  CUSTODY_REPOSITORY,
  CustodyRepositoryPort,
} from './application/ports/custody-repository.port';
import {
  GRAPHICAL_ACCOUNT_REPOSITORY,
  GraphicalAccountRepositoryPort,
} from './application/ports/graphical-account-repository.port';
import { CustodyRepository } from './infrastructure/persistence/prisma/custody.repository';
import { GraphicalAccountRepository } from './infrastructure/persistence/prisma/graphical-account.repository';
import { GetMasterAccountCustodyUseCase } from './application/use-cases/get-master-account-custody.usecase';
import { UpdateAccountCustodyUseCase } from './application/use-cases/update-account-custody.usecase';
import { GetAccountCustodyUseCase } from './application/use-cases/get-account-custody.usecase';
import { CreateGraphicalAccountUseCase } from './application/use-cases/create-graphical-account.usecase';
import { CUSTODY_API } from './api/custody-api.interface';
import { CustodyApi } from './api/custody.api';
import { CustodyController } from './infrastructure/web/custody.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CustodyController],
  providers: [
    {
      provide: CUSTODY_REPOSITORY,
      useClass: CustodyRepository,
    },
    {
      provide: GRAPHICAL_ACCOUNT_REPOSITORY,
      useClass: GraphicalAccountRepository,
    },
    {
      provide: CreateGraphicalAccountUseCase,
      useFactory: (graphicalAccountRepo: GraphicalAccountRepositoryPort) =>
        new CreateGraphicalAccountUseCase(graphicalAccountRepo),
      inject: [GRAPHICAL_ACCOUNT_REPOSITORY],
    },
    {
      provide: GetMasterAccountCustodyUseCase,
      useFactory: (
        custodyRepo: CustodyRepositoryPort,
        graphicalAccountRepo: GraphicalAccountRepositoryPort,
      ) =>
        new GetMasterAccountCustodyUseCase(custodyRepo, graphicalAccountRepo),
      inject: [CUSTODY_REPOSITORY, GRAPHICAL_ACCOUNT_REPOSITORY],
    },
    {
      provide: UpdateAccountCustodyUseCase,
      useFactory: (custodyRepo: CustodyRepositoryPort) =>
        new UpdateAccountCustodyUseCase(custodyRepo),
      inject: [CUSTODY_REPOSITORY],
    },
    {
      provide: GetAccountCustodyUseCase,
      useFactory: (custodyRepo: CustodyRepositoryPort) =>
        new GetAccountCustodyUseCase(custodyRepo),
      inject: [CUSTODY_REPOSITORY],
    },
    {
      provide: CUSTODY_API,
      useFactory: (
        createGraphicalAccount: CreateGraphicalAccountUseCase,
        getMaster: GetMasterAccountCustodyUseCase,
        updateCustody: UpdateAccountCustodyUseCase,
        getAccountCustody: GetAccountCustodyUseCase,
        custodyRepo: CustodyRepositoryPort,
      ) =>
        new CustodyApi(
          createGraphicalAccount,
          getMaster,
          updateCustody,
          getAccountCustody,
          custodyRepo,
        ),
      inject: [
        CreateGraphicalAccountUseCase,
        GetMasterAccountCustodyUseCase,
        UpdateAccountCustodyUseCase,
        GetAccountCustodyUseCase,
        CUSTODY_REPOSITORY,
      ],
    },
  ],
  exports: [CUSTODY_API],
})
export class CustodyModule {}
