import { Customer } from '../../domain/customer.entity';

export interface CreateCustomerRequestDto {
  name: string;
  mainDocumentCode: string;
  email: string;
  monthlyDeposit: number;
}

export class CreateCustomerRequestMapper {
  static toDomain(dto: CreateCustomerRequestDto): Customer {
    return Customer.create({
      name: dto.name,
      mainDocumentCode: dto.mainDocumentCode,
      email: dto.email,
      monthlyAmount: dto.monthlyDeposit,
      active: true,
      brokerageAccountId: null,
    });
  }
}
