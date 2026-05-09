import { ValueObject } from '@/shared/kernel/value-object';
import { DomainError } from '@/shared/errors/domain.exception';

interface BasketItemProps {
  ticker: string;
  allocationPercentage: number;
}

export class BasketItem extends ValueObject<BasketItemProps> {
  private constructor(props: BasketItemProps) {
    super(props);
  }

  get ticker(): string {
    return this.props.ticker;
  }
  get allocationPercentage(): number {
    return this.props.allocationPercentage;
  }

  static create(ticker: string, allocationPercentage: number): BasketItem {
    if (!ticker || ticker.trim().length === 0) {
      throw new DomainError('Ticker cannot be empty');
    }
    if (allocationPercentage <= 0 || allocationPercentage > 100) {
      throw new DomainError(
        `Allocation percentage must be between 0 and 100, got ${allocationPercentage}`,
      );
    }
    return new BasketItem({
      ticker: ticker.toUpperCase().trim(),
      allocationPercentage,
    });
  }
}
