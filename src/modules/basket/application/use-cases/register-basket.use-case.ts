import { randomUUID } from 'node:crypto';
import { RecommendationBasket } from '@/modules/basket/domain/recommendation-basket.entity';
import { BasketItem } from '@/modules/basket/domain/basket-item.vo';
import { BasketRepositoryPort } from '@/modules/basket/application/ports/basket-repository.port';
import { EventBusPort } from '@/shared/events/event-bus.interface';
import { RegisterBasketRequestDto } from '@/modules/basket/application/dtos/register-basket-request.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';

// RN-017: deactivates the current basket and creates a new active one
// RN-018: only one basket can be active at a time
// RN-019: BasketChangedEvent is raised by the aggregate and dispatched here
export class RegisterBasketUseCase {
  constructor(
    private readonly basketRepo: BasketRepositoryPort,
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(dto: RegisterBasketRequestDto): Promise<BasketResponseDto> {
    const currentActive = await this.basketRepo.findActive();
    if (currentActive) {
      currentActive.deactivate();
      await this.basketRepo.save(currentActive);
    }

    const items = dto.items.map((i) =>
      BasketItem.create(i.ticker, i.allocationPercentage),
    );
    const basket = RecommendationBasket.create(randomUUID(), items);

    await this.basketRepo.save(basket);

    for (const event of basket.domainEvents) {
      await this.eventBus.publish(event);
    }
    basket.clearEvents();

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
