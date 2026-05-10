import { Injectable } from '@nestjs/common';
import { AccountCustody } from '../../domain/account-custody.entity';
import type { CustodyRepositoryPort } from '../ports/custody-repository.port';
import { DomainError } from '@/shared/errors/domain.exception';

@Injectable()
export class GetAccountCustodyUseCase {
  constructor(private readonly custodyRepo: CustodyRepositoryPort) {}

  async execute(graphicalAccountId: string): Promise<AccountCustody> {
    const custody = await this.custodyRepo.findByAccountId(graphicalAccountId);

    if (!custody) {
      throw new DomainError('Account custody not found', 404);
    }

    return custody;
  }
}
