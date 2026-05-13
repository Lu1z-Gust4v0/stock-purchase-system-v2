import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { Injectable } from '@nestjs/common';
import { Money } from '@/shared/domain/money.vo';
import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import { BasketResponseDto } from '@/modules/basket/application/dtos/basket-response.dto';
import { RebalanceByBasketChangeRequestDto } from '../../application/dtos/rebalance-by-basket-change-request.dto';
import {
  RebalanceCalculator,
  RebalanceCalculatorResponse,
  RebalanceQuantities,
} from './rebalance-calculator.base';

@Injectable()
export class ByBasketChangeCalculator extends RebalanceCalculator {
  constructor(quotesApi: QuotesApiInterface, orderApi: OrderApiInterface) {
    super(quotesApi, orderApi);
  }

  async calculate(
    dto: RebalanceByBasketChangeRequestDto,
  ): Promise<RebalanceCalculatorResponse> {
    const { accountCustody, newBasket } = dto;

    const prices = await this.fetchPrices(newBasket, accountCustody);

    const saleQuantities = this.calculateSaleQuantities(
      accountCustody,
      newBasket,
    );
    const availableAmount = this.calculateAvailableAmount(
      accountCustody,
      saleQuantities,
      prices,
    );
    const purchaseQuantities = this.calculatePurchaseQuantities(
      accountCustody,
      newBasket,
      prices,
      availableAmount,
    );
    const rebalanceQuantities = this.calculateRebalanceQuantities(
      accountCustody,
      newBasket,
      prices,
    );

    const quantities: RebalanceQuantities = {
      ...saleQuantities,
      ...purchaseQuantities,
      ...rebalanceQuantities,
    };

    const { orders, netSpent } = this.buildOrders(quantities, prices);
    const changes = this.buildChanges(quantities, accountCustody, prices);

    return {
      orders,
      changes,
      leftovers: accountCustody.currency.amount.subtract(netSpent),
    };
  }

  private calculateSaleQuantities(
    accountCustody: AccountCustodyResponseDto,
    basket: BasketResponseDto,
  ): RebalanceQuantities {
    const basketTickers = new Set(basket.items.map((item) => item.ticker));
    const quantities: RebalanceQuantities = {};

    for (const [ticker, position] of Object.entries(accountCustody.positions)) {
      if (basketTickers.has(ticker)) continue;
      quantities[ticker] = -position.quantity;
    }

    return quantities;
  }

  private calculateAvailableAmount(
    accountCustody: AccountCustodyResponseDto,
    saleQuantities: RebalanceQuantities,
    prices: Map<string, Money>,
  ): Money {
    return Object.entries(saleQuantities).reduce(
      (acc, [ticker, quantity]) =>
        acc.add(this.getPriceOrThrow(ticker, prices).multiply(-quantity)),
      accountCustody.currency.amount,
    );
  }

  private calculatePurchaseQuantities(
    accountCustody: AccountCustodyResponseDto,
    basket: BasketResponseDto,
    prices: Map<string, Money>,
    availableAmount: Money,
  ): RebalanceQuantities {
    const itemsToPurchase = basket.items.filter(
      (item) => !accountCustody.positions[item.ticker]?.quantity,
    );

    const percentageSum = itemsToPurchase.reduce(
      (acc, item) => acc + item.allocationPercentage,
      0,
    );

    const quantities: RebalanceQuantities = {};

    for (const item of itemsToPurchase) {
      const percentage = item.allocationPercentage / percentageSum;
      const amount = availableAmount.multiply(percentage);
      const quantity = Math.floor(
        amount.divide(this.getPriceOrThrow(item.ticker, prices).amount).amount,
      );

      if (quantity <= 0) continue;
      quantities[item.ticker] = quantity;
    }

    return quantities;
  }

  private calculateRebalanceQuantities(
    accountCustody: AccountCustodyResponseDto,
    basket: BasketResponseDto,
    prices: Map<string, Money>,
  ): RebalanceQuantities {
    const custodyValue = this.computeCustodyValue(accountCustody, prices);

    const itemsToRebalance = basket.items.filter(
      (item) => !!accountCustody.positions[item.ticker]?.quantity,
    );

    const quantities: RebalanceQuantities = {};

    for (const { ticker, allocationPercentage } of itemsToRebalance) {
      const targetAmount = custodyValue.multiply(allocationPercentage / 100);
      const targetQuantity = Math.floor(
        targetAmount.divide(this.getPriceOrThrow(ticker, prices).amount).amount,
      );
      const currentQuantity = accountCustody.positions[ticker].quantity;

      quantities[ticker] = targetQuantity - currentQuantity;
    }

    return quantities;
  }
}
