import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { CustomerResponseDto } from '@/modules/customer/application/dtos/customer-response.dto';
import { Money } from '@/shared/domain/money.vo';
import { randomUUID } from 'node:crypto';
import { DistributionDto } from '../../application/dtos/distribution.dto';

export interface DistributionCalculationInput {
  customer: CustomerResponseDto;
  masterAccount: AccountCustodyResponseDto;
  purchaseTotalAmount: Money;
}

export class DistributionCalculatorService {
  private static readonly PURCHASE_DATES_PER_MONTH = 3;

  static calculate(input: DistributionCalculationInput): DistributionDto {
    const { customer, masterAccount, purchaseTotalAmount } = input;

    const customerAmount = customer.monthlyDeposit.divide(
      this.PURCHASE_DATES_PER_MONTH,
    );
    const distributionProportion =
      customerAmount.amount / purchaseTotalAmount.amount;

    const items = Object.entries(masterAccount.positions).map(
      ([ticker, position]) => ({
        ticker,
        quantity: Math.floor(distributionProportion * position.quantity),
        unitaryPrice: position.averagePrice,
      }),
    );

    return {
      id: randomUUID(),
      amount: customerAmount,
      origin: masterAccount.graphicalAccountId,
      destination: customer.graphicalAccountId,
      items,
      createdAt: new Date(),
    };
  }
}
