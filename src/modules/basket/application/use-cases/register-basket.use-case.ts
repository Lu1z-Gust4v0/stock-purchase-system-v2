import { RecommendationBasket } from '@/modules/basket/domain/recommendation-basket.entity';
import { BasketItem } from '@/modules/basket/domain/basket-item.vo';
import { BasketRepositoryPort } from '@/modules/basket/application/ports/basket-repository.port';
import { EventBusPort } from '@/shared/events/event-bus.interface';
import { RegisterBasketRequestDto } from '@/modules/basket/application/dtos/register-basket-request.dto';
import {
  BasketResponseDto,
  BasketResponseDtoMapper,
} from '@/modules/basket/application/dtos/basket-response.dto';

// RN-017: deactivates the current basket and creates a new active one
// RN-018: only one basket can be active at a time
// RN-019: BasketChangedEvent is raised by the aggregate and dispatched here
export class RegisterBasketUseCase {
  constructor(
    private readonly basketRepo: BasketRepositoryPort,

    private readonly eventBus: EventBusPort,
  ) {}

  async execute(dto: RegisterBasketRequestDto): Promise<BasketResponseDto> {
    await this.deactivatePreviousBasket();

    const basket = await this.createBasket(dto);

    await this.publishBasketEvents(basket);

    return BasketResponseDtoMapper.toResponse(basket);
  }

  private async deactivatePreviousBasket(): Promise<void> {
    const currentActive = await this.basketRepo.findActive();

    if (!currentActive) return;

    currentActive.deactivate();
    await this.basketRepo.save(currentActive);
  }

  private async createBasket(
    dto: RegisterBasketRequestDto,
  ): Promise<RecommendationBasket> {
    const items = dto.items.map((item) =>
      BasketItem.create(item.ticker, item.allocationPercentage),
    );

    const basket = RecommendationBasket.create(dto.name, items);

    await this.basketRepo.save(basket);

    return basket;
  }

  private async publishBasketEvents(
    basket: RecommendationBasket,
  ): Promise<void> {
    for (const event of basket.domainEvents) {
      await this.eventBus.publish(event);
    }

    basket.clearEvents();
  }
}
