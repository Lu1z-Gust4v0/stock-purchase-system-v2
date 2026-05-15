import { Money } from '@/shared/domain/money.vo';

export interface DistributionItemDto {
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
}

export interface DistributionDto {
  id: string;
  amount: Money;
  origin: string;
  destination: string;
  items: DistributionItemDto[];
  createdAt: Date;
}
