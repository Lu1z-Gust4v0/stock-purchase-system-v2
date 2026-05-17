import { ApiProperty } from '@nestjs/swagger';
import {
  BasketItemDto,
  BasketResponseDto,
} from '@/modules/basket/application/dtos/basket-response.dto';

export class BasketItemResponse {
  @ApiProperty({ example: 'PETR4' })
  ticker!: string;

  @ApiProperty({ example: 25.5 })
  allocationPercentage!: number;
}

export class BasketResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Carteira Conservadora' })
  name!: string;

  @ApiProperty({ type: [BasketItemResponse] })
  items!: BasketItemResponse[];

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt!: Date;
}

export class BasketResponseMapper {
  static toResponse(dto: BasketResponseDto): BasketResponse {
    return {
      id: dto.id,
      name: dto.name,
      items: dto.items.map((i: BasketItemDto) => ({
        ticker: i.ticker,
        allocationPercentage: i.allocationPercentage,
      })),
      active: dto.active,
      createdAt: dto.createdAt,
    };
  }

  static toResponseList(dtos: BasketResponseDto[]): BasketResponse[] {
    return dtos.map((dto) => this.toResponse(dto));
  }
}
