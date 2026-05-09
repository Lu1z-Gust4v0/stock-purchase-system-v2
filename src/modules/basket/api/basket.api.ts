import { Injectable } from '@nestjs/common';
import { BasketApiInterface } from '@/modules/basket/api/basket-api.interface';
import { GetCurrentBasketUseCase } from '@/modules/basket/application/use-cases/get-current-basket.use-case';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';

@Injectable()
export class BasketApi implements BasketApiInterface {
  constructor(private readonly getCurrentBasket: GetCurrentBasketUseCase) {}

  async getActiveBasket(): Promise<BasketResponseDto | null> {
    return await this.getCurrentBasket.execute();
  }
}
