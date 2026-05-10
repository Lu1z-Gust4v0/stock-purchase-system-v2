import { Injectable } from '@nestjs/common';
import { AccountCustody } from '../../domain/account-custody.entity';
import type { CustodyRepositoryPort } from '../ports/custody-repository.port';
import type { GraphicalAccountRepositoryPort } from '../ports/graphical-account-repository.port';
import { DomainError } from '@/shared/errors/domain.exception';

@Injectable()
export class GetMasterAccountCustodyUseCase {
  constructor(
    private readonly custodyRepo: CustodyRepositoryPort,
    private readonly graphicalAccountRepo: GraphicalAccountRepositoryPort,
  ) {}

  async execute(): Promise<AccountCustody> {
    const graphicalAccount =
      await this.graphicalAccountRepo.findMasterAccount();

    if (!graphicalAccount) {
      throw new DomainError('Master account not found', 404);
    }

    const accountCustody = await this.custodyRepo.findByAccountId(
      graphicalAccount.id,
    );

    if (!accountCustody) {
      throw new DomainError('Account custody not found', 404);
    }

    return accountCustody;
  }
}
