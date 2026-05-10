import { Injectable } from '@nestjs/common';
import type { CustomerRepositoryPort } from '../ports/customer-repository.port';
import { MonthlyAmount } from '../../domain/value-objects/monthly-amount.vo';
import { DomainError } from '@/shared/errors/domain.exception';

@Injectable()
export class UpdateCustomerDepositUseCase {
  constructor(private readonly customerRepo: CustomerRepositoryPort) {}

  async execute(customerId: string, monthlyDeposit: number): Promise<void> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new DomainError('Customer not found', 404);
    }

    customer.updateMonthlyAmount(MonthlyAmount.create(monthlyDeposit));

    await this.customerRepo.save(customer);
  }
}
