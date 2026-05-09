import { RecommendationBasket } from '@/modules/basket/domain/recommendation-basket.entity';

export const BASKET_REPOSITORY_PORT = Symbol('BASKET_REPOSITORY_PORT');

export interface BasketRepositoryPort {
  save(basket: RecommendationBasket): Promise<void>;
  findActive(): Promise<RecommendationBasket | null>;
  findById(id: string): Promise<RecommendationBasket | null>;
  findAll(): Promise<RecommendationBasket[]>;
}
