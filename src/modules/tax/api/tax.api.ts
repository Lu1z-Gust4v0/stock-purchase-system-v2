import { Injectable } from '@nestjs/common';
import type { TaxApiInterface } from './tax-api.interface';
import { CalculateSalesTaxUseCase } from '../application/use-cases/calculate-sales-tax.usecase';
import { CalculateRegulatoryTaxUseCase } from '../application/use-cases/calculate-regulatory-tax.usecase';
import { PublishTaxUseCase } from '../application/use-cases/publish-tax.usecase';
import type { CalculateSalesTaxRequestDto } from '../application/dtos/calculate-sales-tax-request.dto';
import type { CalculateSalesTaxResponseDto } from '../application/dtos/calculate-sales-tax-response.dto';
import type { CalculateRegulatoryTaxRequestDto } from '../application/dtos/calculate-regulatory-tax-request.dto';
import type { CalculateRegulatoryTaxResponseDto } from '../application/dtos/calculate-regulatory-tax-response.dto';
import type { PublishTaxRequestDto } from '../application/dtos/publish-tax-request.dto';

@Injectable()
export class TaxApi implements TaxApiInterface {
  constructor(
    private readonly calculateSalesTaxUseCase: CalculateSalesTaxUseCase,
    private readonly calculateRegulatoryTaxUseCase: CalculateRegulatoryTaxUseCase,
    private readonly publishTaxUseCase: PublishTaxUseCase,
  ) {}

  async calculateSalesTax(
    dto: CalculateSalesTaxRequestDto,
  ): Promise<CalculateSalesTaxResponseDto> {
    return this.calculateSalesTaxUseCase.execute(dto);
  }

  calculateRegulatoryTax(
    dto: CalculateRegulatoryTaxRequestDto,
  ): CalculateRegulatoryTaxResponseDto {
    return this.calculateRegulatoryTaxUseCase.execute(dto);
  }

  async publishTax(dto: PublishTaxRequestDto): Promise<void> {
    return this.publishTaxUseCase.execute(dto);
  }
}
