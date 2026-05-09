import { Inject, Injectable } from '@nestjs/common';
import { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import { BasketRepositoryPort, BASKET_REPOSITORY_PORT } from '@/modules/basket/application/ports/basket-repository.port';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';

@Injectable()
export class BasketApi implements BasketApiInterface {
  constructor(
    @Inject(BASKET_REPOSITORY_PORT)
    private readonly basketRepo: BasketRepositoryPort,
  ) {}

  async getActiveBasket(): Promise<BasketResponseDto | null> {
    const basket = await this.basketRepo.findActive();
    if (!basket) return null;
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
}
