import { AccountCustody } from '../../domain/account-custody.entity';

export const CUSTODY_REPOSITORY = Symbol('CUSTODY_REPOSITORY');

export interface CustodyRepositoryPort {
  save(custody: AccountCustody): Promise<void>;
  findByAccountId(accountId: string): Promise<AccountCustody | null>;
}
