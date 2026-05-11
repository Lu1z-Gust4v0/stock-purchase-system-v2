export interface CalculateSalesTaxResponseDto {
  exempt: boolean;
  totalSalesAmount: number;
  netProfit: number;
  taxAmount: number;
}
