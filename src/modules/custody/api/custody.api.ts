import { Injectable } from '@nestjs/common';
import { GetMasterAccountCustodyUseCase } from '../application/use-cases/get-master-account-custody.usecase';
import { UpdateAccountCustodyUseCase } from '../application/use-cases/update-account-custody.usecase';
import { CustodyApiInterface } from './custody-api.interface';
import { AccountCustody } from '../domain/account-custody.entity';
import { UpdateAccountCustodyRequestDto } from '../application/ports/update-account-custody-request.dto';

@Injectable()
export class CustodyApi implements CustodyApiInterface {
  constructor(
    private readonly getMasterAccountUseCase: GetMasterAccountCustodyUseCase,
    private readonly updateAccountCustodyUseCase: UpdateAccountCustodyUseCase,
  ) {}

  async getMasterAccountCustody(): Promise<AccountCustody> {
    return this.getMasterAccountUseCase.execute();
  }

  async updateAccountCustody(
    dto: UpdateAccountCustodyRequestDto,
  ): Promise<void> {
    return this.updateAccountCustodyUseCase.execute(dto);
  }
}
