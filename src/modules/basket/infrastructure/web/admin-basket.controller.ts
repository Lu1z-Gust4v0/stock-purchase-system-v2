import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RegisterBasketUseCase } from '@/modules/basket/application/use-cases/register-basket.use-case';
import { GetCurrentBasketUseCase } from '@/modules/basket/application/use-cases/get-current-basket.use-case';
import { ListBasketHistoryUseCase } from '@/modules/basket/application/use-cases/list-basket-history.use-case';
import { type RegisterBasketRequestDto } from '@/modules/basket/application/dtos/register-basket-request.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';

@Controller('admin/baskets')
export class AdminBasketController {
  constructor(
    private readonly registerBasket: RegisterBasketUseCase,
    private readonly getCurrentBasket: GetCurrentBasketUseCase,
    private readonly listBasketHistory: ListBasketHistoryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterBasketRequestDto,
  ): Promise<BasketResponseDto> {
    return await this.registerBasket.execute(dto);
  }

  @Get('active')
  async getActive(): Promise<BasketResponseDto> {
    return await this.getCurrentBasket.execute();
  }

  @Get()
  async listHistory(): Promise<BasketResponseDto[]> {
    return this.listBasketHistory.execute();
  }
}
