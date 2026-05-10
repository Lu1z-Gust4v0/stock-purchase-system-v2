import { UpdateAccountCustodyRequestDto } from '../application/ports/update-account-custody-request.dto';
import { AccountCustody } from '../domain/account-custody.entity';

export const CUSTODY_API = Symbol('CUSTODY_API');

export interface CustodyApiInterface {
  getMasterAccountCustody(): Promise<AccountCustody>;

  updateAccountCustody(dto: UpdateAccountCustodyRequestDto): Promise<void>;

  getAccountCustody(accountId: string): Promise<AccountCustody>;
}
