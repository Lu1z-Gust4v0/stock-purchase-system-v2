import { AggregateRoot } from '../../shared/kernel/aggregate-root';
import { BasketItem } from './basket-item.vo';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { BasketChangedEvent } from '../../shared/events/domain-events/basket-changed.event';

export class RecommendationBasket extends AggregateRoot<string> {
  static readonly BASKET_SIZE = 5;

  private readonly _items: BasketItem[];
  private _active: boolean;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    items: BasketItem[],
    active: boolean,
    createdAt: Date,
  ) {
    super(id);
    this._items = items;
    this._active = active;
    this._createdAt = createdAt;
  }

  get items(): BasketItem[] {
    return [...this._items];
  }
  get active(): boolean {
    return this._active;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  static create(id: string, items: BasketItem[]): RecommendationBasket {
    if (items.length !== RecommendationBasket.BASKET_SIZE) {
      throw new DomainException(
        `Basket must contain exactly ${RecommendationBasket.BASKET_SIZE} items, got ${items.length}`,
      );
    }

    const total = items.reduce(
      (sum, item) => sum + item.allocationPercentage,
      0,
    );
    if (Math.abs(total - 100) > 0.01) {
      throw new DomainException(
        `Basket allocations must sum to 100%, got ${total}%`,
      );
    }

    const basket = new RecommendationBasket(id, items, true, new Date());
    basket.addDomainEvent(new BasketChangedEvent(id));
    return basket;
  }

  static reconstitute(
    id: string,
    items: BasketItem[],
    active: boolean,
    createdAt: Date,
  ): RecommendationBasket {
    return new RecommendationBasket(id, items, active, createdAt);
  }

  deactivate(): void {
    this._active = false;
  }
}
