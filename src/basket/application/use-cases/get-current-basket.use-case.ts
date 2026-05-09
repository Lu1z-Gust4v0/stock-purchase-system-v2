import { RecommendationBasket } from '../../domain/recommendation-basket.entity';
import { BasketRepositoryPort } from '../ports/basket-repository.port';
import { BasketResponseDto } from '../dtos/basket-response.dto';
import { DomainException } from '../../../shared/exceptions/domain.exception';

export class GetCurrentBasketUseCase {
  constructor(private readonly basketRepo: BasketRepositoryPort) {}

  async execute(): Promise<BasketResponseDto> {
    const basket = await this.basketRepo.findActive();
    if (!basket) {
      throw new DomainException('No active recommendation basket found');
    }
    return toDto(basket);
  }
}

function toDto(basket: RecommendationBasket): BasketResponseDto {
  return {
    id: basket.id,
    items: basket.items.map((i) => ({
      ticker: i.ticker,
      allocationPercentage: i.allocationPercentage,
    })),
    active: basket.active,
    createdAt: basket.createdAt,
  };
}
