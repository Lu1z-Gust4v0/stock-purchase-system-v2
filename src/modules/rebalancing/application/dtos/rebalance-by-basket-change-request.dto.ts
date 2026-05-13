import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';
import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';

export interface RebalanceByBasketChangeRequestDto {
  accountCustody: AccountCustodyResponseDto;
  newBasket: BasketResponseDto;
}
