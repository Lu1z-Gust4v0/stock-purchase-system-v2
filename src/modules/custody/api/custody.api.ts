import { Injectable } from '@nestjs/common';
import { GetMasterAccountCustodyUseCase } from '../application/use-cases/get-master-account-custody.usecase';
import { UpdateAccountCustodyUseCase } from '../application/use-cases/update-account-custody.usecase';
import { GetAccountCustodyUseCase } from '../application/use-cases/get-account-custody.usecase';
import { CreateGraphicalAccountUseCase } from '../application/use-cases/create-graphical-account.usecase';
import { CustodyApiInterface } from './custody-api.interface';
import { AccountCustody } from '../domain/account-custody.entity';
import { GraphicalAccount } from '../domain/graphical-account.entity';
import { UpdateAccountCustodyRequestDto } from '../application/ports/update-account-custody-request.dto';
import { type CustodyRepositoryPort } from '../application/ports/custody-repository.port';

@Injectable()
export class CustodyApi implements CustodyApiInterface {
  constructor(
    private readonly createGraphicalAccountUseCase: CreateGraphicalAccountUseCase,
    private readonly getMasterAccountUseCase: GetMasterAccountCustodyUseCase,
    private readonly updateAccountCustodyUseCase: UpdateAccountCustodyUseCase,
    private readonly getAccountCustodyUseCase: GetAccountCustodyUseCase,
    private readonly custodyRepo: CustodyRepositoryPort,
  ) {}

  async createGraphicalAccount(clientId: string): Promise<GraphicalAccount> {
    return this.createGraphicalAccountUseCase.execute(clientId);
  }

  async getMasterAccountCustody(): Promise<AccountCustody> {
    return this.getMasterAccountUseCase.execute();
  }

  async updateAccountCustody(
    dto: UpdateAccountCustodyRequestDto,
  ): Promise<void> {
    return this.updateAccountCustodyUseCase.execute(dto);
  }

  async getAccountCustody(accountId: string): Promise<AccountCustody> {
    return this.getAccountCustodyUseCase.execute(accountId);
  }

  async getMonthlySalesVolume(
    accountId: string,
    referenceDate: Date,
  ): Promise<number> {
    return this.custodyRepo.getMonthlySalesVolume(accountId, referenceDate);
  }
}
