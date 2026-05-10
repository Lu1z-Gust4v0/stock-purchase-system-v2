import { AggregateRoot } from '@/shared/kernel/aggregate-root';
import { BasketItem } from '@/modules/basket/domain/basket-item.vo';
import { DomainError } from '@/shared/errors/domain.exception';
import { BasketChangedEvent } from '@/shared/events/domain-events/basket-changed.event';
import { randomUUID } from 'node:crypto';

export class RecommendationBasket extends AggregateRoot<string> {
  static readonly BASKET_SIZE = 5;

  private readonly _items: BasketItem[];
  private readonly _name: string;
  private _active: boolean;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    name: string,
    items: BasketItem[],
    active: boolean,
    createdAt: Date,
  ) {
    super(id);
    this._items = items;
    this._name = name;
    this._active = active;
    this._createdAt = createdAt;
  }

  get items(): BasketItem[] {
    return this._items;
  }
  get name(): string {
    return this._name;
  }
  get active(): boolean {
    return this._active;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  static create(name: string, items: BasketItem[]): RecommendationBasket {
    if (items.length !== RecommendationBasket.BASKET_SIZE) {
      throw new DomainError(
        `Basket must contain exactly ${RecommendationBasket.BASKET_SIZE} items, got ${items.length}`,
        422,
      );
    }

    const total = items.reduce(
      (sum, item) => sum + item.allocationPercentage,
      0,
    );
    if (Math.abs(total - 100) > 0.01) {
      throw new DomainError(
        `Basket allocations must sum to 100%, got ${total}%`,
        422,
      );
    }
    const basketId = randomUUID();
    const basket = new RecommendationBasket(
      basketId,
      name,
      items,
      true,
      new Date(),
    );
    basket.addDomainEvent(new BasketChangedEvent(basketId));
    return basket;
  }

  static reconstitute(
    id: string,
    name: string,
    items: BasketItem[],
    active: boolean,
    createdAt: Date,
  ): RecommendationBasket {
    return new RecommendationBasket(id, name, items, active, createdAt);
  }

  deactivate(): void {
    this._active = false;
  }
}
