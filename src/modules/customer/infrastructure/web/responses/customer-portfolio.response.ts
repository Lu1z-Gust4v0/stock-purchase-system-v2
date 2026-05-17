import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@/shared/dtos/money.dto';
import { Money } from '@/shared/domain/money.vo';
import { GetCustomerPortfolioResponseDto } from '@/modules/customer/application/dtos/get-customer-portfolio-response.dto';
import { CustomerResponse, CustomerResponseMapper } from './customer.response';

export class StockSummaryResponse {
  @ApiProperty({ example: 'PETR4' })
  ticker!: string;

  @ApiProperty({ example: 100 })
  quantity!: number;

  @ApiProperty({ type: MoneyDto })
  averagePrice!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  currentPrice!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  currentAmount!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  earnings!: MoneyDto;

  @ApiProperty({ example: 12.5, description: 'Earnings percentage (%)' })
  earningsPercentage!: number;

  @ApiProperty({
    example: 25,
    description: 'Portfolio allocation percentage (%)',
  })
  allocation!: number;
}

export class PortfolioSummaryResponse {
  @ApiProperty({ type: MoneyDto })
  amountInvested!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  currentAmount!: MoneyDto;

  @ApiProperty({ type: MoneyDto })
  earnings!: MoneyDto;

  @ApiProperty({ example: 12.5, description: 'Total earnings percentage (%)' })
  earningsPercentage!: number;

  @ApiProperty({ type: MoneyDto })
  balance!: MoneyDto;

  @ApiProperty({ type: [StockSummaryResponse] })
  stocks!: StockSummaryResponse[];
}

export class CustomerPortfolioResponse {
  @ApiProperty({ type: CustomerResponse })
  customer!: CustomerResponse;

  @ApiProperty({ type: PortfolioSummaryResponse })
  portfolio!: PortfolioSummaryResponse;
}

function toMoneyDto(money: Money): MoneyDto {
  return { amount: money.amount, currency: money.currency };
}

export class CustomerPortfolioResponseMapper {
  static toResponse(
    dto: GetCustomerPortfolioResponseDto,
  ): CustomerPortfolioResponse {
    return {
      customer: CustomerResponseMapper.toResponse(dto.customer),
      portfolio: {
        amountInvested: toMoneyDto(dto.portfolio.amountInvested),
        currentAmount: toMoneyDto(dto.portfolio.currentAmount),
        earnings: toMoneyDto(dto.portfolio.earnings),
        earningsPercentage: dto.portfolio.earningsPercentage,
        balance: toMoneyDto(dto.portfolio.balance),
        stocks: dto.portfolio.stocks.map((s) => ({
          ticker: s.ticker,
          quantity: s.quantity,
          averagePrice: toMoneyDto(s.averagePrice),
          currentPrice: toMoneyDto(s.currentPrice),
          currentAmount: toMoneyDto(s.currentAmount),
          earnings: toMoneyDto(s.earnings),
          earningsPercentage: s.earningsPercentage,
          allocation: s.allocation,
        })),
      },
    };
  }
}
