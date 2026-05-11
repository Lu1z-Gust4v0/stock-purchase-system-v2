import { UpdateAccountCustodyRequestDto } from '../application/ports/update-account-custody-request.dto';
import { AccountCustodyResponseDto } from './account-custody-response.dto';
import { GraphicalAccount } from '../domain/graphical-account.entity';

export const CUSTODY_API = Symbol('CUSTODY_API');

export interface CustodyApiInterface {
  createGraphicalAccount(clientId: string): Promise<GraphicalAccount>;

  getMasterAccountCustody(): Promise<AccountCustodyResponseDto>;

  updateAccountCustody(dto: UpdateAccountCustodyRequestDto): Promise<void>;

  getAccountCustody(accountId: string): Promise<AccountCustodyResponseDto>;

  getMonthlySalesVolume(
    accountId: string,
    referenceDate: Date,
  ): Promise<number>;

  getMonthlyProfitVolume(
    accountId: string,
    referenceDate: Date,
  ): Promise<number>;
}
