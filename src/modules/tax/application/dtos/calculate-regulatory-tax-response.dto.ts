import { Money } from '@/shared/domain/money.vo';

export interface CalculateRegulatoryTaxResponseDto {
  rate: number;
  taxAmount: Money;
}
