import { Injectable } from '@nestjs/common';
import { CustomerApiInterface } from './customer-api.interface';
import { CreateCustomerUseCase } from '../application/use-cases/create-customer.usecase';
import { DisableCustomerUseCase } from '../application/use-cases/disable-customer.usecase';
import { UpdateCustomerDepositUseCase } from '../application/use-cases/update-customer-deposit.usecase';
import { GetCustomerPortfolioUseCase } from '../application/use-cases/get-customer-portfolio.usecase';
import { CreateCustomerRequestDto } from '../application/dtos/create-customer-request.dto';
import {
  CustomerResponseDto,
  CustomerResponseMapper,
} from '../application/dtos/customer-response.dto';
import type { GetCustomerPortfolioResponseDto } from '../application/dtos/get-customer-portfolio-response.dto';
import type { CustomerRepositoryPort } from '../application/ports/customer-repository.port';
import { Money } from '@/shared/domain/money.vo';

@Injectable()
export class CustomerApi implements CustomerApiInterface {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly disableCustomerUseCase: DisableCustomerUseCase,
    private readonly updateCustomerDepositUseCase: UpdateCustomerDepositUseCase,
    private readonly getCustomerPortfolioUseCase: GetCustomerPortfolioUseCase,
    private readonly customerRepo: CustomerRepositoryPort,
  ) {}

  async createCustomer(
    dto: CreateCustomerRequestDto,
  ): Promise<CustomerResponseDto> {
    return this.createCustomerUseCase.execute(dto);
  }

  async disableCustomer(customerId: string): Promise<void> {
    return this.disableCustomerUseCase.execute(customerId);
  }

  async updateCustomerDeposit(
    customerId: string,
    monthlyDeposit: number,
  ): Promise<void> {
    return this.updateCustomerDepositUseCase.execute(
      customerId,
      monthlyDeposit,
    );
  }

  async getActiveClients(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepo.findAllActive();
    return customers.map(CustomerResponseMapper.toResponse);
  }

  async countActiveClients(): Promise<number> {
    return await this.customerRepo.countActiveClients();
  }

  async getMonthlyTotalClientDeposit(): Promise<Money> {
    return await this.customerRepo.getMonthlyTotalClientDeposit();
  }

  async getCustomerPortfolio(
    customerId: string,
  ): Promise<GetCustomerPortfolioResponseDto> {
    return this.getCustomerPortfolioUseCase.execute(customerId);
  }
}
