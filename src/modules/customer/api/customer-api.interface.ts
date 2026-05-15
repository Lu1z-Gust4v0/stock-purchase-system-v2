import { Money } from '@/shared/domain/money.vo';
import { CreateCustomerRequestDto } from '../application/dtos/create-customer-request.dto';
import { CustomerResponseDto } from '../application/dtos/customer-response.dto';

export const CUSTOMER_API = Symbol('CUSTOMER_API');

export interface CustomerApiInterface {
  createCustomer(dto: CreateCustomerRequestDto): Promise<CustomerResponseDto>;
  disableCustomer(customerId: string): Promise<void>;
  updateCustomerDeposit(
    customerId: string,
    monthlyDeposit: number,
  ): Promise<void>;
  getActiveClients(): Promise<CustomerResponseDto[]>;
  countActiveClients(): Promise<number>;
  getMonthlyTotalClientDeposit(): Promise<Money>;
}
