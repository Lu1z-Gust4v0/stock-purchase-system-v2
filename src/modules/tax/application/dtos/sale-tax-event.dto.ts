export interface SaleTaxEventDto {
  clientId: string;
  cpf: string;
  referenceMonth: string;
  totalSalesAmount: number;
  netProfit: number;
  rate: number;
  taxAmount: number;
  calculationDate: string;
}
