import { Customer } from '../../domain/customer.entity';

export interface CustomerResponseDto {
  id: string;
  name: string;
  mainDocumentCode: string;
  email: string;
  monthlyDeposit: number;
  active: boolean;
  createdAt: string;
}

export class CustomerResponseMapper {
  static toResponse(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      name: customer.name,
      mainDocumentCode: customer.mainDocumentCode.value,
      email: customer.email.value,
      monthlyDeposit: customer.monthlyAmount.value.amount,
      active: customer.active,
      createdAt: customer.createdAt.toISOString(),
    };
  }
}
