import { Money } from '@/shared/domain/money.vo';

export interface CalculateRegulatoryTaxRequestDto {
  operationValue: Money;
}
