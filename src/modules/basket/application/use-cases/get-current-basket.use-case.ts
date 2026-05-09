import { BasketRepositoryPort } from '@/modules/basket/application/ports/basket-repository.port';
import {
  BasketResponseDto,
  BasketResponseDtoMapper,
} from '@/modules/basket/application/dtos/basket-response.dto';
import { DomainError } from '@/shared/errors/domain.exception';

export class GetCurrentBasketUseCase {
  constructor(private readonly basketRepo: BasketRepositoryPort) {}

  async execute(): Promise<BasketResponseDto> {
    const basket = await this.basketRepo.findActive();

    if (!basket) {
      throw new DomainError('No active recommendation basket found', 404);
    }

    return BasketResponseDtoMapper.toResponse(basket);
  }
}
