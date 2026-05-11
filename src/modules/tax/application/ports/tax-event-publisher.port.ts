import type { WithholdingTaxEventDto } from '../dtos/withholding-tax-event.dto';
import type { SaleTaxEventDto } from '../dtos/sale-tax-event.dto';

export const TAX_EVENT_PUBLISHER = Symbol('TAX_EVENT_PUBLISHER');

export interface TaxEventPublisherPort {
  publishWithholdingTax(event: WithholdingTaxEventDto): Promise<void>;
  publishSaleTax(event: SaleTaxEventDto): Promise<void>;
}
