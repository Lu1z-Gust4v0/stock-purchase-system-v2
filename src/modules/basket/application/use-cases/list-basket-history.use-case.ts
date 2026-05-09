import { BasketRepositoryPort } from '@/modules/basket/application/ports/basket-repository.port';
import {
  BasketResponseDto,
  BasketResponseDtoMapper,
} from '@/modules/basket/application/dtos/basket-response.dto';

export class ListBasketHistoryUseCase {
  constructor(private readonly basketRepo: BasketRepositoryPort) {}

  async execute(): Promise<BasketResponseDto[]> {
    const baskets = await this.basketRepo.findAll();

    return baskets.map((basket) => BasketResponseDtoMapper.toResponse(basket));
  }
}
