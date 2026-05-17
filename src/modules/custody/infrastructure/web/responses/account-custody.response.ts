import { ApiProperty } from '@nestjs/swagger';
import { GetAccountCustodyResponseDto } from '@/modules/custody/application/dtos/get-account-custody-response.dto';

export class AssetPositionResponse {
  @ApiProperty({ example: 'PETR4' })
  ticker!: string;

  @ApiProperty({ example: 100 })
  quantity!: number;

  @ApiProperty({ example: 28.5 })
  averagePrice!: number;

  @ApiProperty({ example: 2850 })
  totalValue!: number;
}

export class CurrencyResponse {
  @ApiProperty({ example: 'BRL' })
  code!: string;

  @ApiProperty({ example: 5000 })
  amount!: number;
}

export class AccountCustodyResponse {
  @ApiProperty({ example: 'ACC-123456' })
  graphicalAccountId!: string;

  @ApiProperty({ type: [AssetPositionResponse] })
  positions!: AssetPositionResponse[];

  @ApiProperty({ type: CurrencyResponse })
  currency!: CurrencyResponse;
}

export class AccountCustodyResponseMapper {
  static toResponse(dto: GetAccountCustodyResponseDto): AccountCustodyResponse {
    return {
      graphicalAccountId: dto.graphicalAccountId,
      positions: dto.positions.map((p) => ({
        ticker: p.ticker,
        quantity: p.quantity,
        averagePrice: p.averagePrice,
        totalValue: p.totalValue,
      })),
      currency: {
        code: dto.currency.code,
        amount: dto.currency.amount,
      },
    };
  }
}
