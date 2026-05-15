import { DomainError } from '../errors/domain.exception';
import { ValueObject } from '../kernel/value-object';

export enum Currency {
  BRL = 'BRL',
}

export interface MoneyProps {
  amount: number;
  currency: Currency;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): Currency {
    return this.props.currency;
  }

  static fromNumber(amount: number, currency: Currency = Currency.BRL): Money {
    if (!Number.isFinite(amount)) {
      throw new DomainError('Invalid monetary amount: not finite');
    }
    return new Money({ amount, currency });
  }

  static zero(currency: Currency = Currency.BRL): Money {
    return new Money({ amount: 0, currency });
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromNumber(
      this.props.amount + other.props.amount,
      this.props.currency,
    );
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromNumber(
      this.props.amount - other.props.amount,
      this.props.currency,
    );
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor)) {
      throw new DomainError('Invalid multiplication factor: not finite');
    }
    return Money.fromNumber(this.props.amount * factor, this.props.currency);
  }

  divide(divisor: number): Money {
    if (!Number.isFinite(divisor) || divisor === 0) {
      throw new DomainError(
        'Invalid division: divisor must be a non-zero finite number',
      );
    }
    return Money.fromNumber(this.props.amount / divisor, this.props.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.props.amount > other.props.amount;
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.props.amount < other.props.amount;
  }

  isZero(): boolean {
    return this.props.amount === 0;
  }

  isPositive(): boolean {
    return this.props.amount > 0;
  }

  toJSON(): { amount: number; currency: Currency } {
    return {
      amount: this.props.amount,
      currency: this.props.currency,
    };
  }

  private assertSameCurrency(other: Money): void {
    if (this.props.currency !== other.props.currency) {
      throw new DomainError(
        'Currency mismatch: ' +
          String(this.props.currency) +
          ' vs ' +
          String(other.props.currency),
      );
    }
  }
}
