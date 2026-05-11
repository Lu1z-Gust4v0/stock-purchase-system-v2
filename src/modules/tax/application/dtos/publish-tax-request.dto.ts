import { TaxType } from '../../domain/tax.entity';

type BasePublishTaxRequest = {
  graphicalAccountId: string;
  clientId: string;
  mainDocumentCode: string;
  taxAmount: number;
};

export type PublishRegulatoryTaxRequestDto = BasePublishTaxRequest & {
  type: TaxType.REGULATORY;
  ticker: string;
  quantity: number;
  unitaryPrice: number;
  operationDate: Date;
};

export type PublishSaleTaxRequestDto = BasePublishTaxRequest & {
  type: TaxType.SALE;
  referenceMonth: string;
  totalSalesAmount: number;
  netProfit: number;
};

export type PublishTaxRequestDto =
  | PublishRegulatoryTaxRequestDto
  | PublishSaleTaxRequestDto;
