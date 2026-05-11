export interface WithholdingTaxEventDto {
  clientId: string;
  cpf: string;
  ticker: string;
  quantity: number;
  unitaryPrice: number;
  operationValue: number;
  rate: number;
  taxAmount: number;
  operationDate: string;
}
