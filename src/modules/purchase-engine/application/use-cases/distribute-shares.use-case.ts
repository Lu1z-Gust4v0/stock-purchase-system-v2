import { Injectable } from '@nestjs/common';
import { DistributeSharesRequestDto } from '../dtos/distribute-shares-request.dto';
import { DistributionCalculatorService } from '../../domain/services/distribution-calculator.service';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import { Money } from '@/shared/domain/money.vo';
import { CustodyEventType } from '@/modules/custody/domain/custody-event.entity';
import type { TaxApiInterface } from '@/modules/tax/api/tax-api.interface';
import { TaxType } from '@/modules/tax/domain/tax.entity';
import { CustomerResponseDto } from '@/modules/customer/application/dtos/customer-response.dto';
import { DistributionDto } from '../dtos/distribution.dto';

@Injectable()
export class DistributeSharesUseCase {
  constructor(
    private readonly custodyApi: CustodyApiInterface,
    private readonly taxApi: TaxApiInterface,
  ) {}

  async execute(dto: DistributeSharesRequestDto): Promise<void> {
    const { customer } = dto;

    const distribution = DistributionCalculatorService.calculate(dto);

    await this.updateAccountsCustody(distribution);

    await this.calculateAndPublishTaxes(distribution, customer);

    await this.custodyApi.saveDistribution({
      amount: distribution.amount,
      graphicalAccountId: distribution.destination,
      createdAt: distribution.createdAt,
    });
  }

  private async updateAccountsCustody(
    distribution: DistributionDto,
  ): Promise<void> {
    const changes = distribution.items.map((item) => ({
      quantity: item.quantity,
      ticker: item.ticker,
      type: CustodyEventType.DISTRIBUTION,
      unitaryPrice: item.unitaryPrice,
      profit: Money.zero(),
    }));

    // Take shares from master and move them to customer
    await Promise.all([
      this.custodyApi.updateAccountCustody({
        graphicalAccountId: distribution.origin,
        changes: changes.map((change) => ({
          ...change,
          quantity: -change.quantity,
        })),
      }),
      this.custodyApi.updateAccountCustody({
        graphicalAccountId: distribution.destination,
        changes: changes,
      }),
    ]);
  }

  private async calculateAndPublishTaxes(
    distribution: DistributionDto,
    customer: CustomerResponseDto,
  ): Promise<void> {
    for (const item of distribution.items) {
      const { taxAmount } = this.taxApi.calculateRegulatoryTax({
        operationValue: item.unitaryPrice.multiply(item.quantity),
      });

      await this.taxApi.publishTax({
        type: TaxType.REGULATORY,
        clientId: customer.id,
        graphicalAccountId: customer.graphicalAccountId,
        mainDocumentCode: customer.mainDocumentCode,
        ticker: item.ticker,
        quantity: item.quantity,
        unitaryPrice: item.unitaryPrice,
        taxAmount: taxAmount,
        operationDate: distribution.createdAt,
      });
    }
  }
}
