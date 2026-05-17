import { AggregateRoot } from '@/shared/kernel/aggregate-root';
import { MainDocumentCode } from '@/modules/customer/domain/value-objects/main-document-code.vo';
import { Email } from '@/modules/customer/domain/value-objects/email.vo';
import { MonthlyAmount } from '@/modules/customer/domain/value-objects/monthly-amount.vo';
import { v7 as uuidv7 } from 'uuid';

export interface CustomerProps {
  name: string;
  mainDocumentCode: string;
  email: string;
  monthlyAmount: number;
  active: boolean;
  brokerageAccountId: string | null;
  createdAt: Date;
}

export class Customer extends AggregateRoot<string> {
  private readonly _name: string;
  private readonly _mainDocumentCode: MainDocumentCode;
  private readonly _email: Email;
  private _monthlyAmount: MonthlyAmount;
  private _active: boolean;
  private _brokerageAccountId: string | null;
  private readonly _createdAt: Date;

  private constructor(id: string, props: CustomerProps) {
    super(id);
    this._name = props.name;
    this._mainDocumentCode = MainDocumentCode.create(props.mainDocumentCode);
    this._email = Email.create(props.email);
    this._monthlyAmount = MonthlyAmount.create(props.monthlyAmount);
    this._active = props.active;
    this._brokerageAccountId = props.brokerageAccountId;
    this._createdAt = props.createdAt;
  }

  get name(): string {
    return this._name;
  }
  get mainDocumentCode(): MainDocumentCode {
    return this._mainDocumentCode;
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

  static create(props: Omit<CustomerProps, 'createdAt'>): Customer {
    return new Customer(uuidv7(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static reconstitute(id: string, props: CustomerProps): Customer {
    return new Customer(id, props);
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
