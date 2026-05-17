import { Controller, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CUSTOMER_API } from '@/modules/customer/api/customer-api.interface';
import type { CustomerApiInterface } from '@/modules/customer/api/customer-api.interface';
import { CalculateSalesTaxUseCase } from '../../application/use-cases/calculate-sales-tax.usecase';
import { PublishTaxUseCase } from '../../application/use-cases/publish-tax.usecase';
import { TaxType } from '../../domain/tax.entity';
import { Money } from '@/shared/domain/money.vo';

@Controller()
export class CustomerTaxesPublisherJob {
  private readonly logger = new Logger(CustomerTaxesPublisherJob.name);

  constructor(
    @Inject(CUSTOMER_API) private readonly customerApi: CustomerApiInterface,
    private readonly calculateSalesTax: CalculateSalesTaxUseCase,
    private readonly publishTax: PublishTaxUseCase,
  ) {}

  @Cron('0 3 1 * *', { timeZone: 'UTC' })
  async run(): Promise<void> {
    const today = new Date();
    const referenceDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const referenceMonth = referenceDate.toISOString().slice(0, 7);
    const activeCustomers = await this.customerApi.getActiveClients();

    this.logger.log(
      `Starting sales tax publishing for ${activeCustomers.length} customers — reference month: ${referenceMonth}`,
    );

    for (const customer of activeCustomers) {
      const result = await this.calculateSalesTax.execute({
        graphicalAccountId: customer.graphicalAccountId,
        referenceDate,
      });

      if (result.exempt) {
        this.logger.log(
          `Customer ${customer.id} is exempt from sales tax for ${referenceMonth}`,
        );
        continue;
      }

      if (result.taxAmount <= 0) {
        this.logger.log(
          `Customer ${customer.id} has no taxable profit for ${referenceMonth}`,
        );
        continue;
      }

      this.logger.log(
        `Publishing sales tax for customer ${customer.id} — amount: ${result.taxAmount}`,
      );
      await this.publishTax.execute({
        type: TaxType.SALE,
        clientId: customer.id,
        graphicalAccountId: customer.graphicalAccountId,
        mainDocumentCode: customer.mainDocumentCode,
        referenceMonth,
        totalSalesAmount: Money.fromNumber(result.totalSalesAmount),
        netProfit: Money.fromNumber(result.netProfit),
        taxAmount: Money.fromNumber(result.taxAmount),
      });
    }

    this.logger.log(`Sales tax publishing completed for ${referenceMonth}`);
  }
}
