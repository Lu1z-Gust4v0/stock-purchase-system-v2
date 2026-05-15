import { Money } from '@/shared/domain/money.vo';
import { Customer } from '../../domain/customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryPort {
  save(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findByMainDocumentCode(mainDocumentCode: string): Promise<Customer | null>;
  findAllActive(): Promise<Customer[]>;
  countActiveClients(): Promise<number>;
  getMonthlyTotalClientDeposit(): Promise<Money>;
}
