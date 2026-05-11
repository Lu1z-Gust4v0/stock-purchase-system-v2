import type { Tax } from '../../domain/tax.entity';

export const TAX_REPOSITORY = Symbol('TAX_REPOSITORY');

export interface TaxRepositoryPort {
  save(tax: Tax): Promise<void>;
}
