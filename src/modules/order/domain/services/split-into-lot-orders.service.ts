import { Injectable } from '@nestjs/common';
import { Money } from '@/shared/domain/money.vo';
import { MarketType, OrderItem } from '../order.entity';
import { SplitIntoLotOrdersRequestDto } from '../../application/dtos/split-into-lot-orders-request.dto';
import { SplitIntoLotOrdersResponseDto } from '../../application/dtos/split-into-lot-orders-response.dto';

@Injectable()
export class SplitIntoLotOrdersService {
  private static readonly STANDARD_LOT_SIZE = 100;

  execute(dto: SplitIntoLotOrdersRequestDto): SplitIntoLotOrdersResponseDto {
    const { ticker, signedQuantity, spotPrice, fractionalPrice } = dto;
    const orders: OrderItem[] = [];
    let orderAmount = Money.zero();

    const absQuantity = Math.abs(signedQuantity);
    const isPurchase = signedQuantity > 0;
    const fractional =
      absQuantity % SplitIntoLotOrdersService.STANDARD_LOT_SIZE;
    const standardLot = absQuantity - fractional;

    if (fractional > 0) {
      orders.push({
        ticker,
        quantity: isPurchase ? fractional : -fractional,
        unitaryPrice: fractionalPrice,
        marketType: MarketType.FRACTIONAL,
      });
      orderAmount = orderAmount.add(fractionalPrice.multiply(fractional));
    }

    if (standardLot >= SplitIntoLotOrdersService.STANDARD_LOT_SIZE) {
      orders.push({
        ticker,
        quantity: isPurchase ? standardLot : -standardLot,
        unitaryPrice: spotPrice,
        marketType: MarketType.SPOT,
      });
      orderAmount = orderAmount.add(spotPrice.multiply(standardLot));
    }

    return { orders, orderAmount };
  }
}
