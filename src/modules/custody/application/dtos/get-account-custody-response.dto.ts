import { AccountCustody } from '../../domain/account-custody.entity';

export interface AssetPositionResponseDto {
  ticker: string;
  quantity: number;
  averagePrice: number;
  totalValue: number;
}

export interface CurrencyResponseDto {
  code: string;
  amount: number;
}

export interface GetAccountCustodyResponseDto {
  graphicalAccountId: string;
  positions: AssetPositionResponseDto[];
  currency: CurrencyResponseDto;
}

export class GetAccountCustodyResponseMapper {
  static toResponse(custody: AccountCustody): GetAccountCustodyResponseDto {
    return {
      graphicalAccountId: custody.graphicalAccountId,
      positions: Array.from(custody.positions.values()).map((position) => ({
        ticker: position.ticker,
        quantity: position.quantity,
        averagePrice: position.averagePrice.amount,
        totalValue: position.totalValue.amount,
      })),
      currency: {
        code: custody.currency.code,
        amount: custody.currency.amount.amount,
      },
    };
  }
}
