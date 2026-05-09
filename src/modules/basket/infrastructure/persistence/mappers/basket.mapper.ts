import { RecommendationBasket } from '@/modules/basket/domain/recommendation-basket.entity';
import { BasketItem } from '@/modules/basket/domain/basket-item.vo';
import {
  Basket as BasketRecord,
  BasketItem as BasketItemRecord,
} from '@/generated/prisma/client';

type BasketWithItems = BasketRecord & { items: BasketItemRecord[] };

export class BasketMapper {
  static toDomain(record: BasketWithItems): RecommendationBasket {
    const items = record.items.map((i) =>
      BasketItem.create(i.code, Number(i.percentage)),
    );
    return RecommendationBasket.reconstitute(
      record.id,
      record.name,
      items,
      record.active,
      record.createdAt,
    );
  }
}
