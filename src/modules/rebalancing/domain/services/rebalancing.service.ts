import { RebalancingAction } from '@/modules/rebalancing/domain/rebalancing-log.entity';

export interface CurrentPosition {
  ticker: string;
  quantity: number;
  averagePrice: number;
}

export interface BasketAllocation {
  ticker: string;
  allocationPercentage: number;
}

export interface RebalancingInput {
  customerId: string;
  currentPositions: CurrentPosition[];
  targetBasket: BasketAllocation[];
  prices: Map<string, number>;
  portfolioValue: number;
}

export class RebalancingService {
  calculateActions(input: RebalancingInput): RebalancingAction[] {
    const { currentPositions, targetBasket, prices, portfolioValue } = input;
    const actions: RebalancingAction[] = [];

    // Sell positions no longer in the basket
    for (const position of currentPositions) {
      const inNewBasket = targetBasket.some(
        (item) => item.ticker === position.ticker,
      );
      if (!inNewBasket && position.quantity > 0) {
        const price = prices.get(position.ticker) ?? 0;
        actions.push({
          ticker: position.ticker,
          action: 'SELL',
          quantity: position.quantity,
          price,
        });
      }
    }

    // Adjust positions that are in the new basket
    for (const item of targetBasket) {
      const price = prices.get(item.ticker);
      if (!price) continue;

      const targetQuantity = Math.floor(
        ((item.allocationPercentage / 100) * portfolioValue) / price,
      );
      const current = currentPositions.find((p) => p.ticker === item.ticker);
      const currentQuantity = current?.quantity ?? 0;

      if (targetQuantity > currentQuantity) {
        actions.push({
          ticker: item.ticker,
          action: 'BUY',
          quantity: targetQuantity - currentQuantity,
          price,
        });
      } else if (targetQuantity < currentQuantity) {
        actions.push({
          ticker: item.ticker,
          action: 'SELL',
          quantity: currentQuantity - targetQuantity,
          price,
        });
      }
    }

    return actions;
  }
}
