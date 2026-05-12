import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { CustomerResponseDto } from '@/modules/customer/application/dtos/customer-response.dto';
import { Money } from '@/shared/domain/money.vo';

export interface DistributeSharesRequestDto {
  customer: CustomerResponseDto;
  masterAccount: AccountCustodyResponseDto;
  purchaseTotalAmount: Money;
}
