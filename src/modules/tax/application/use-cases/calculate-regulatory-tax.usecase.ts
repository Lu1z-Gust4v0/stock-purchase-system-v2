import { Injectable } from '@nestjs/common';
import { REGULATORY_TAX_RATE } from '../../domain/tax-rates';
import type { CalculateRegulatoryTaxRequestDto } from '../dtos/calculate-regulatory-tax-request.dto';
import type { CalculateRegulatoryTaxResponseDto } from '../dtos/calculate-regulatory-tax-response.dto';

@Injectable()
export class CalculateRegulatoryTaxUseCase {
  execute(
    dto: CalculateRegulatoryTaxRequestDto,
  ): CalculateRegulatoryTaxResponseDto {
    return {
      rate: REGULATORY_TAX_RATE,
      taxAmount: dto.operationValue.multiply(REGULATORY_TAX_RATE),
    };
  }
}
