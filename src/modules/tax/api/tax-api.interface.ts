import type { CalculateSalesTaxRequestDto } from '../application/dtos/calculate-sales-tax-request.dto';
import type { CalculateSalesTaxResponseDto } from '../application/dtos/calculate-sales-tax-response.dto';
import type { CalculateRegulatoryTaxRequestDto } from '../application/dtos/calculate-regulatory-tax-request.dto';
import type { CalculateRegulatoryTaxResponseDto } from '../application/dtos/calculate-regulatory-tax-response.dto';
import type { PublishTaxRequestDto } from '../application/dtos/publish-tax-request.dto';

export const TAX_API = Symbol('TAX_API');

export interface TaxApiInterface {
  calculateSalesTax(
    dto: CalculateSalesTaxRequestDto,
  ): Promise<CalculateSalesTaxResponseDto>;

  calculateRegulatoryTax(
    dto: CalculateRegulatoryTaxRequestDto,
  ): CalculateRegulatoryTaxResponseDto;

  publishTax(dto: PublishTaxRequestDto): Promise<void>;
}
