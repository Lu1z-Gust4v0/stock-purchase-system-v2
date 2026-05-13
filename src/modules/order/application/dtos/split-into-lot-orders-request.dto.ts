import { Money } from '@/shared/domain/money.vo';

export interface SplitIntoLotOrdersRequestDto {
  ticker: string;
  signedQuantity: number;
  spotPrice: Money;
  fractionalPrice: Money;
}
