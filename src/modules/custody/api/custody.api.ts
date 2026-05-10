import { Injectable } from '@nestjs/common';
import { GetMasterAccountCustodyUseCase } from '../application/use-cases/get-master-account-custody.usecase';
import { UpdateAccountCustodyUseCase } from '../application/use-cases/update-account-custody.usecase';
import { CustodyApiInterface } from './custody-api.interface';
import { AccountCustody } from '../domain/account-custody.entity';
import { UpdateAccountCustodyRequestDto } from '../application/ports/update-account-custody-request.dto';
import { GetAccountCustodyUseCase } from '../application/use-cases/get-account-custody.usecase';

@Injectable()
export class CustodyApi implements CustodyApiInterface {
  constructor(
    private readonly getMasterAccountUseCase: GetMasterAccountCustodyUseCase,
    private readonly updateAccountCustodyUseCase: UpdateAccountCustodyUseCase,
    private readonly getAccountCustodyUseCase: GetAccountCustodyUseCase,
  ) {}

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
}
