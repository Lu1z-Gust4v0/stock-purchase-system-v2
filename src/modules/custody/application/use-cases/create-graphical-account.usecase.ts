import { Injectable } from '@nestjs/common';
import type { GraphicalAccountRepositoryPort } from '../ports/graphical-account-repository.port';
import {
  GraphicalAccount,
  AccountType,
} from '../../domain/graphical-account.entity';

@Injectable()
export class CreateGraphicalAccountUseCase {
  constructor(
    private readonly graphicalAccountRepo: GraphicalAccountRepositoryPort,
  ) {}

  async execute(clientId: string): Promise<GraphicalAccount> {
    const account = GraphicalAccount.create(
      clientId,
      clientId,
      AccountType.CHILD,
    );
    await this.graphicalAccountRepo.save(account);
    return account;
  }
}
