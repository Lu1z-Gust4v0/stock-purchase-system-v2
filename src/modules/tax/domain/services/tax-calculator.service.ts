export interface TaxCalculationResult {
  withholdingTax: number;
  saleTax: number;
  netProceeds: number;
}

export class TaxCalculatorService {
  // DARF withholding: 0.005% on gross sale amount
  static readonly WITHHOLDING_TAX_RATE = 0.00005;
  // IR on profit from equity sales: 20%
  static readonly SALE_TAX_RATE = 0.2;

  calculateWithholdingTax(grossAmount: number): number {
    return parseFloat(
      (grossAmount * TaxCalculatorService.WITHHOLDING_TAX_RATE).toFixed(2),
    );
  }

  calculateSaleTax(profit: number): number {
    if (profit <= 0) return 0;
    return parseFloat((profit * TaxCalculatorService.SALE_TAX_RATE).toFixed(2));
  }

  calculate(grossAmount: number, costBasis: number): TaxCalculationResult {
    const profit = grossAmount - costBasis;
    const withholdingTax = this.calculateWithholdingTax(grossAmount);
    const saleTax = this.calculateSaleTax(profit);

    return {
      withholdingTax,
      saleTax,
      netProceeds: parseFloat(
        (grossAmount - withholdingTax - saleTax).toFixed(2),
      ),
    };
  }
}
