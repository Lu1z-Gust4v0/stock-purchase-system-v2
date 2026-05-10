import { Injectable } from '@nestjs/common';
import type { CustomerRepositoryPort } from '../ports/customer-repository.port';
import { DomainError } from '@/shared/errors/domain.exception';

@Injectable()
export class DisableCustomerUseCase {
  constructor(private readonly customerRepo: CustomerRepositoryPort) {}

  async execute(customerId: string): Promise<void> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new DomainError('Customer not found', 404);
    }

    customer.deactivate();
    await this.customerRepo.save(customer);
  }
}
