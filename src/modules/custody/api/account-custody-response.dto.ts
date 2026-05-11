import { Money } from '@/shared/domain/money.vo';
import { AccountCustody } from '../domain/account-custody.entity';

export interface AccountCustodyPositionDto {
  ticker: string;
  quantity: number;
  averagePrice: Money;
  totalValue: Money;
}

export interface AccountCustodyCurrencyDto {
  code: string;
  amount: Money;
}

export interface AccountCustodyResponseDto {
  graphicalAccountId: string;
  positions: AccountCustodyPositionDto[];
  currency: AccountCustodyCurrencyDto;
}

export class AccountCustodyResponseMapper {
  static toDto(custody: AccountCustody): AccountCustodyResponseDto {
    return {
      graphicalAccountId: custody.graphicalAccountId,
      positions: Array.from(custody.positions.values()).map((position) => ({
        ticker: position.ticker,
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        totalValue: position.totalValue,
      })),
      currency: {
        code: custody.currency.code,
        amount: custody.currency.amount,
      },
    };
  }
}
