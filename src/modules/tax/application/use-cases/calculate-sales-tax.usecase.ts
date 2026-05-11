import { Injectable } from '@nestjs/common';
import {
  SALE_TAX_EXEMPTION_THRESHOLD,
  SALE_TAX_RATE,
} from '../../domain/tax-rates';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { CalculateSalesTaxRequestDto } from '../dtos/calculate-sales-tax-request.dto';
import type { CalculateSalesTaxResponseDto } from '../dtos/calculate-sales-tax-response.dto';

@Injectable()
export class CalculateSalesTaxUseCase {
  constructor(private readonly custodyApi: CustodyApiInterface) {}

  async execute(
    dto: CalculateSalesTaxRequestDto,
  ): Promise<CalculateSalesTaxResponseDto> {
    const totalSalesAmount = await this.custodyApi.getMonthlySalesVolume(
      dto.graphicalAccountId,
      dto.referenceDate,
    );

    if (totalSalesAmount <= SALE_TAX_EXEMPTION_THRESHOLD) {
      return { exempt: true, totalSalesAmount, netProfit: 0, taxAmount: 0 };
    }

    const netProfit = await this.custodyApi.getMonthlyProfitVolume(
      dto.graphicalAccountId,
      dto.referenceDate,
    );

    if (netProfit <= 0) {
      return { exempt: false, totalSalesAmount, netProfit, taxAmount: 0 };
    }

    return {
      exempt: false,
      totalSalesAmount,
      netProfit,
      taxAmount: netProfit * SALE_TAX_RATE,
    };
  }
}
