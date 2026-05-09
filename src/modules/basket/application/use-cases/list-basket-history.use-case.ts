import { RecommendationBasket } from '@/modules/basket/domain/recommendation-basket.entity';
import { BasketRepositoryPort } from '@/modules/basket/application/ports/basket-repository.port';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';

export class ListBasketHistoryUseCase {
  constructor(private readonly basketRepo: BasketRepositoryPort) {}

  async execute(): Promise<BasketResponseDto[]> {
    const baskets = await this.basketRepo.findAll();
    return baskets.map(toDto);
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
