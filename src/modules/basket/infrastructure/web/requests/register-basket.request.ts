import { ApiProperty } from '@nestjs/swagger';

export class BasketItemRequest {
  @ApiProperty({ example: 'PETR4' })
  ticker!: string;

  @ApiProperty({ example: 25.5, description: 'Allocation percentage (0–100)' })
  allocationPercentage!: number;
}

export class RegisterBasketRequest {
  @ApiProperty({ example: 'Carteira Conservadora' })
  name!: string;

  @ApiProperty({ type: [BasketItemRequest] })
  items!: BasketItemRequest[];
}
