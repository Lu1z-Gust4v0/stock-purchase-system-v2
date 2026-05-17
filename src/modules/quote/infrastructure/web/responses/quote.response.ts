import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@/shared/dtos/money.dto';
import { QuoteResponseDto } from '@/modules/quote/application/dtos/quote-response.dto';

export class QuoteResponse {
  @ApiProperty({ example: 'PETR4' })
  ticker!: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  date!: string;

  @ApiProperty({ type: MoneyDto })
  closingPrice!: MoneyDto;
}

export class QuoteResponseMapper {
  static toResponse(dto: QuoteResponseDto): QuoteResponse {
    return {
      ticker: dto.ticker,
      date: dto.date,
      closingPrice: {
        amount: dto.closingPrice.amount,
        currency: dto.closingPrice.currency,
      },
    };
  }

  static toResponseList(dtos: QuoteResponseDto[]): QuoteResponse[] {
    return dtos.map((dto) => QuoteResponseMapper.toResponse(dto));
  }
}
