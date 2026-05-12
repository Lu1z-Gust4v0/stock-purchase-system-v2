import { Money } from '@/shared/domain/money.vo';
import { Customer } from '../../domain/customer.entity';

export interface CustomerResponseDto {
  id: string;
  name: string;
  mainDocumentCode: string;
  email: string;
  monthlyDeposit: Money;
  active: boolean;
  graphicalAccountId: string;
  createdAt: string;
}

export class CustomerResponseMapper {
  static toResponse(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      name: customer.name,
      mainDocumentCode: customer.mainDocumentCode.value,
      email: customer.email.value,
      monthlyDeposit: customer.monthlyAmount.value,
      active: customer.active,
      graphicalAccountId: customer.brokerageAccountId!,
      createdAt: customer.createdAt.toISOString(),
    };
  }
}
