import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { Injectable } from '@nestjs/common';
import { Money } from '@/shared/domain/money.vo';
import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';
import {
  RebalanceCalculator,
  RebalanceCalculatorResponse,
  RebalanceQuantities,
} from './rebalance-calculator.base';

interface ByDeviationCalculatorInput {
  accountCustody: AccountCustodyResponseDto;
  basket: BasketResponseDto;
}

@Injectable()
export class ByDeviationCalculator extends RebalanceCalculator {
  private static readonly DEVIATION_THRESHOLD = 0.05;

  constructor(quotesApi: QuotesApiInterface, orderApi: OrderApiInterface) {
    super(quotesApi, orderApi);
  }

  async calculate(
    input: ByDeviationCalculatorInput,
  ): Promise<RebalanceCalculatorResponse> {
    const { accountCustody, basket } = input;

    const prices = await this.fetchPrices(basket, accountCustody);

    const quantities = this.calculateRebalanceQuantities(
      accountCustody,
      basket,
      prices,
    );

    const { orders, netSpent } = this.buildOrders(quantities, prices);
    const changes = this.buildChanges(quantities, accountCustody, prices);

    return {
      orders,
      changes,
      leftovers: accountCustody.currency.amount.subtract(netSpent),
    };
  }

  private calculateRebalanceQuantities(
    accountCustody: AccountCustodyResponseDto,
    basket: BasketResponseDto,
    prices: Map<string, Money>,
  ): RebalanceQuantities {
    const custodyValue = this.computeCustodyValue(accountCustody, prices);
    const quantities: RebalanceQuantities = {};

    for (const { ticker, allocationPercentage } of basket.items) {
      const currentQuantity = accountCustody.positions[ticker].quantity;
      const currentValue = this.getPriceOrThrow(ticker, prices).multiply(
        currentQuantity,
      );

      const currentPercentage = currentValue.divide(custodyValue.amount).amount;
      const targetPercentage = allocationPercentage / 100;
      const percentageDelta = Math.abs(targetPercentage - currentPercentage);

      if (percentageDelta < ByDeviationCalculator.DEVIATION_THRESHOLD) continue;

      const targetAmount = custodyValue.multiply(targetPercentage);
      const targetQuantity = Math.floor(
        targetAmount.divide(this.getPriceOrThrow(ticker, prices).amount).amount,
      );

      quantities[ticker] = targetQuantity - currentQuantity;
    }

    return quantities;
  }
}
