import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterBasketUseCase } from '@/modules/basket/application/use-cases/register-basket.use-case';
import { GetCurrentBasketUseCase } from '@/modules/basket/application/use-cases/get-current-basket.use-case';
import { ListBasketHistoryUseCase } from '@/modules/basket/application/use-cases/list-basket-history.use-case';
import { RegisterBasketRequest } from './requests/register-basket.request';
import {
  BasketResponse,
  BasketResponseMapper,
} from './responses/basket.response';

@ApiTags('Baskets')
@Controller('admin/baskets')
export class AdminBasketController {
  constructor(
    private readonly registerBasket: RegisterBasketUseCase,
    private readonly getCurrentBasket: GetCurrentBasketUseCase,
    private readonly listBasketHistory: ListBasketHistoryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new recommendation basket' })
  @ApiResponse({ status: 201, type: BasketResponse })
  async register(@Body() dto: RegisterBasketRequest): Promise<BasketResponse> {
    const result = await this.registerBasket.execute(dto);
    return BasketResponseMapper.toResponse(result);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the current active basket' })
  @ApiResponse({ status: 200, type: BasketResponse })
  async getActive(): Promise<BasketResponse> {
    const result = await this.getCurrentBasket.execute();
    return BasketResponseMapper.toResponse(result);
  }

  @Get()
  @ApiOperation({ summary: 'List all baskets history' })
  @ApiResponse({ status: 200, type: [BasketResponse] })
  async listHistory(): Promise<BasketResponse[]> {
    const result = await this.listBasketHistory.execute();
    return BasketResponseMapper.toResponseList(result);
  }
}
