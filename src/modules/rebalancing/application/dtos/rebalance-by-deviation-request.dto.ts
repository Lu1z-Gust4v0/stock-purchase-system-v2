import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';

export interface RebalanceByDeviationRequestDto {
  customerAccountId: string;
  basket: BasketResponseDto;
}
