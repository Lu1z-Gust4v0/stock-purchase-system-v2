import { RecommendationBasket } from '../../domain/recommendation-basket.entity';

export interface BasketItemDto {
  ticker: string;
  allocationPercentage: number;
}

export interface BasketResponseDto {
  id: string;
  name: string;
  items: BasketItemDto[];
  active: boolean;
  createdAt: Date;
}

export class BasketResponseDtoMapper {
  static toResponse(basket: RecommendationBasket): BasketResponseDto {
    return {
      id: basket.id,
      name: basket.name,
      items: basket.items.map((i) => ({
        ticker: i.ticker,
        allocationPercentage: i.allocationPercentage,
      })),
      active: basket.active,
      createdAt: basket.createdAt,
    };
  }
}
