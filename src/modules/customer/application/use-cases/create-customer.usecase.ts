import { Injectable } from '@nestjs/common';
import type { CustomerRepositoryPort } from '../ports/customer-repository.port';
import {
  CreateCustomerRequestDto,
  CreateCustomerRequestMapper,
} from '../dtos/create-customer-request.dto';
import {
  CustomerResponseDto,
  CustomerResponseMapper,
} from '../dtos/customer-response.dto';
import { DomainError } from '@/shared/errors/domain.exception';

@Injectable()
export class CreateCustomerUseCase {
  constructor(private readonly customerRepo: CustomerRepositoryPort) {}

  async execute(dto: CreateCustomerRequestDto): Promise<CustomerResponseDto> {
    const existing = await this.customerRepo.findByMainDocumentCode(
      dto.mainDocumentCode,
    );
    if (existing) {
      throw new DomainError('Customer with this CPF already exists', 409);
    }

    const customer = CreateCustomerRequestMapper.toDomain(dto);

    await this.customerRepo.save(customer);

    return CustomerResponseMapper.toResponse(customer);
  }
}
