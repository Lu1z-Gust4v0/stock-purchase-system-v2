import { ValueObject } from '@/shared/kernel/value-object';
import { DomainError } from '@/shared/errors/domain.exception';
import { Money } from '@/shared/domain/money.vo';

interface MonthlyAmountProps {
  value: Money;
}

export class MonthlyAmount extends ValueObject<MonthlyAmountProps> {
  static readonly MINIMUM = 100;

  private constructor(props: MonthlyAmountProps) {
    super(props);
  }

  get value(): Money {
    return this.props.value;
  }

  static create(amount: number): MonthlyAmount {
    if (amount < MonthlyAmount.MINIMUM) {
      throw new DomainError(
        `Monthly amount must be at least R$ ${MonthlyAmount.MINIMUM}, got R$ ${amount}`,
      );
    }
    return new MonthlyAmount({ value: Money.fromNumber(amount) });
  }
}
