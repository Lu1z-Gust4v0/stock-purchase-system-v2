import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { CustomerResponseDto } from '@/modules/customer/application/dtos/customer-response.dto';
import { Money } from '@/shared/domain/money.vo';
import { Distribution } from '../distribution.entity';

export interface DistributionCalculationInput {
  customer: CustomerResponseDto;
  masterAccount: AccountCustodyResponseDto;
  purchaseTotalAmount: Money;
}

export class DistributionCalculatorService {
  private static readonly PURCHASE_DATES_PER_MONTH = 3;

  static calculate(input: DistributionCalculationInput): Distribution {
    const { customer, masterAccount, purchaseTotalAmount } = input;

    const customerAmount = customer.monthlyDeposit.divide(
      this.PURCHASE_DATES_PER_MONTH,
    );
    const distributionProportion =
      customerAmount.amount / purchaseTotalAmount.amount;

    const distributionItems = Object.entries(masterAccount.positions).map(
      ([ticker, position]) => ({
        ticker: ticker,
        quantity: Math.floor(distributionProportion * position.quantity),
        unitaryPrice: position.averagePrice,
      }),
    );

    return Distribution.create(
      customerAmount,
      masterAccount.graphicalAccountId,
      customer.graphicalAccountId,
      distributionItems,
    );
  }
}
