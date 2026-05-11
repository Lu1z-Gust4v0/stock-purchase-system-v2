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
  positions: Record<string, AccountCustodyPositionDto>;
  currency: AccountCustodyCurrencyDto;
}

export class AccountCustodyResponseMapper {
  static toDto(custody: AccountCustody): AccountCustodyResponseDto {
    const positions: Record<string, AccountCustodyPositionDto> = {};
    for (const [ticker, position] of custody.positions) {
      positions[ticker] = {
        ticker: position.ticker,
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        totalValue: position.totalValue,
      };
    }

    return {
      graphicalAccountId: custody.graphicalAccountId,
      positions,
      currency: {
        code: custody.currency.code,
        amount: custody.currency.amount,
      },
    };
  }
}
