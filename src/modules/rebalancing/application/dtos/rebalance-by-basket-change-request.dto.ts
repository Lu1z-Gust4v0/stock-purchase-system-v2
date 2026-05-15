import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';

export interface RebalanceByBasketChangeRequestDto {
  customerAccountId: string;
  newBasket: BasketResponseDto;
}
