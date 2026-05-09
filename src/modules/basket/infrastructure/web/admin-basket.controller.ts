import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RegisterBasketUseCase } from '@/modules/basket/application/use-cases/register-basket.use-case';
import { GetCurrentBasketUseCase } from '@/modules/basket/application/use-cases/get-current-basket.use-case';
import { ListBasketHistoryUseCase } from '@/modules/basket/application/use-cases/list-basket-history.use-case';
import { type RegisterBasketRequestDto } from '@/modules/basket/application/dtos/register-basket-request.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';
import { DomainException } from '@/shared/exceptions/domain.exception';

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
    try {
      return await this.registerBasket.execute(dto);
    } catch (err) {
      if (err instanceof DomainException) {
        throw new UnprocessableEntityException(err.message);
      }
      throw err;
    }
  }

  @Get('active')
  async getActive(): Promise<BasketResponseDto> {
    try {
      return await this.getCurrentBasket.execute();
    } catch (err) {
      if (err instanceof DomainException) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }
  }

  @Get()
  async listHistory(): Promise<BasketResponseDto[]> {
    return this.listBasketHistory.execute();
  }
}
