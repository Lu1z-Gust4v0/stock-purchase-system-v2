import { Money } from '@/shared/domain/money.vo';
import { PortfolioSummary } from '../../domain/services/portfolio-summary-calculator.service';
import { Customer } from '../../domain/customer.entity';

interface CustomerDto {
  id: string;
  name: string;
  mainDocumentCode: string;
  email: string;
  monthlyDeposit: Money;
  active: boolean;
  graphicalAccountId: string;
  createdAt: string;
}

export interface GetCustomerPortfolioResponseDto {
  customer: CustomerDto;
  portfolio: PortfolioSummary;
}

export class GetCustomerPortfolioResponseMapper {
  static toResponse(
    customer: Customer,
    summary: PortfolioSummary,
  ): GetCustomerPortfolioResponseDto {
    return {
      customer: {
        id: customer.id,
        name: customer.name,
        mainDocumentCode: customer.mainDocumentCode.value,
        email: customer.email.value,
        monthlyDeposit: customer.monthlyAmount.value,
        active: customer.active,
        graphicalAccountId: customer.brokerageAccountId ?? '',
        createdAt: customer.createdAt.toISOString(),
      },
      portfolio: summary,
    };
  }
}
