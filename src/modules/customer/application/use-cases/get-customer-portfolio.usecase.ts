import { Injectable } from '@nestjs/common';
import type { CustomerRepositoryPort } from '../ports/customer-repository.port';
import {
  GetCustomerPortfolioResponseMapper,
  type GetCustomerPortfolioResponseDto,
} from '../dtos/get-customer-portfolio-response.dto';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import { PortfolioSummaryCalculator } from '../../domain/services/portfolio-summary-calculator.service';
import { DomainError } from '@/shared/errors/domain.exception';

@Injectable()
export class GetCustomerPortfolioUseCase {
  constructor(
    private readonly customerRepo: CustomerRepositoryPort,
    private readonly custodyApi: CustodyApiInterface,
    private readonly portfolioSummaryCalculator: PortfolioSummaryCalculator,
  ) {}

  async execute(customerId: string): Promise<GetCustomerPortfolioResponseDto> {
    const customer = await this.customerRepo.findById(customerId);

    if (!customer) {
      throw new DomainError('Customer not found', 404);
    }

    if (!customer.brokerageAccountId) {
      throw new DomainError('Customer does not have a graphical account', 404);
    }

    const accountCustody = await this.custodyApi.getAccountCustody(
      customer.brokerageAccountId,
    );

    const summary = await this.portfolioSummaryCalculator.calculate({
      accountCustody: accountCustody,
    });

    return GetCustomerPortfolioResponseMapper.toResponse(customer, summary);
  }
}
