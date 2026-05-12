import { Money } from '@/shared/domain/money.vo';
import { TaxType } from '../../domain/tax.entity';

type BasePublishTaxRequest = {
  graphicalAccountId: string;
  clientId: string;
  mainDocumentCode: string;
  taxAmount: Money;
};

export type PublishRegulatoryTaxRequestDto = BasePublishTaxRequest & {
  type: TaxType.REGULATORY;
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
  operationDate: Date;
};

export type PublishSaleTaxRequestDto = BasePublishTaxRequest & {
  type: TaxType.SALE;
  referenceMonth: string;
  totalSalesAmount: Money;
  netProfit: Money;
};

export type PublishTaxRequestDto =
  | PublishRegulatoryTaxRequestDto
  | PublishSaleTaxRequestDto;
