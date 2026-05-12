import { Injectable } from '@nestjs/common';
import { Tax, TaxType } from '../../domain/tax.entity';
import { REGULATORY_TAX_RATE, SALE_TAX_RATE } from '../../domain/tax-rates';
import type { TaxEventPublisherPort } from '../ports/tax-event-publisher.port';
import type { TaxRepositoryPort } from '../ports/tax-repository.port';
import type {
  PublishTaxRequestDto,
  PublishRegulatoryTaxRequestDto,
  PublishSaleTaxRequestDto,
} from '../dtos/publish-tax-request.dto';

@Injectable()
export class PublishTaxUseCase {
  constructor(
    private readonly publisher: TaxEventPublisherPort,
    private readonly taxRepo: TaxRepositoryPort,
  ) {}

  async execute(dto: PublishTaxRequestDto): Promise<void> {
    if (dto.type === TaxType.REGULATORY) {
      return this.publishRegulatory(dto);
    }

    if (dto.type === TaxType.SALE) {
      return this.publishSale(dto);
    }
  }

  private async publishRegulatory(
    dto: PublishRegulatoryTaxRequestDto,
  ): Promise<void> {
    const operationValue = dto.unitaryPrice.multiply(dto.quantity);

    const tax = Tax.create(
      TaxType.REGULATORY,
      operationValue,
      dto.taxAmount,
      dto.graphicalAccountId,
    );

    this.publisher.publishWithholdingTax({
      clientId: dto.clientId,
      cpf: dto.mainDocumentCode,
      ticker: dto.ticker,
      quantity: dto.quantity,
      unitaryPrice: dto.unitaryPrice.amount,
      operationValue: operationValue.amount,
      rate: REGULATORY_TAX_RATE,
      taxAmount: dto.taxAmount.amount,
      operationDate: dto.operationDate.toISOString(),
    });

    await this.persist(tax);
  }

  private async publishSale(dto: PublishSaleTaxRequestDto): Promise<void> {
    const tax = Tax.create(
      TaxType.SALE,
      dto.totalSalesAmount,
      dto.taxAmount,
      dto.graphicalAccountId,
    );

    this.publisher.publishSaleTax({
      clientId: dto.clientId,
      cpf: dto.mainDocumentCode,
      referenceMonth: dto.referenceMonth,
      totalSalesAmount: dto.totalSalesAmount.amount,
      netProfit: dto.netProfit.amount,
      rate: SALE_TAX_RATE,
      taxAmount: dto.taxAmount.amount,
      calculationDate: new Date().toISOString(),
    });

    await this.persist(tax);
  }

  private async persist(tax: Tax): Promise<void> {
    tax.markAsPublished();
    await this.taxRepo.save(tax);
  }
}
