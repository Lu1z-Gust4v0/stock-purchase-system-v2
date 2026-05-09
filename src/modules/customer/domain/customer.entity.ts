import { AggregateRoot } from '@/shared/kernel/aggregate-root';
import { TaxId } from '@/modules/customer/domain/value-objects/tax-id.vo';
import { Email } from '@/modules/customer/domain/value-objects/email.vo';
import { MonthlyAmount } from '@/modules/customer/domain/value-objects/monthly-amount.vo';

export class Customer extends AggregateRoot<string> {
  private _name: string;
  private _taxId: TaxId;
  private _email: Email;
  private _monthlyAmount: MonthlyAmount;
  private _active: boolean;
  private _brokerageAccountId: string | null;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    name: string,
    taxId: TaxId,
    email: Email,
    monthlyAmount: MonthlyAmount,
    active: boolean,
    brokerageAccountId: string | null,
    createdAt: Date,
  ) {
    super(id);
    this._name = name;
    this._taxId = taxId;
    this._email = email;
    this._monthlyAmount = monthlyAmount;
    this._active = active;
    this._brokerageAccountId = brokerageAccountId;
    this._createdAt = createdAt;
  }

  get name(): string {
    return this._name;
  }
  get taxId(): TaxId {
    return this._taxId;
  }
  get email(): Email {
    return this._email;
  }
  get monthlyAmount(): MonthlyAmount {
    return this._monthlyAmount;
  }
  get active(): boolean {
    return this._active;
  }
  get brokerageAccountId(): string | null {
    return this._brokerageAccountId;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  static create(
    id: string,
    name: string,
    taxId: TaxId,
    email: Email,
    monthlyAmount: MonthlyAmount,
  ): Customer {
    return new Customer(
      id,
      name,
      taxId,
      email,
      monthlyAmount,
      true,
      null,
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    name: string,
    taxId: TaxId,
    email: Email,
    monthlyAmount: MonthlyAmount,
    active: boolean,
    brokerageAccountId: string | null,
    createdAt: Date,
  ): Customer {
    return new Customer(
      id,
      name,
      taxId,
      email,
      monthlyAmount,
      active,
      brokerageAccountId,
      createdAt,
    );
  }

  updateMonthlyAmount(amount: MonthlyAmount): void {
    this._monthlyAmount = amount;
  }

  assignBrokerageAccount(accountId: string): void {
    this._brokerageAccountId = accountId;
  }

  deactivate(): void {
    this._active = false;
  }
}
