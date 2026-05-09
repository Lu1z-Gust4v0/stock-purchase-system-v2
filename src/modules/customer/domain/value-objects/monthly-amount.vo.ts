import { ValueObject } from '@/shared/kernel/value-object';
import { DomainError } from '@/shared/errors/domain.exception';

interface MonthlyAmountProps {
  value: number;
}

export class MonthlyAmount extends ValueObject<MonthlyAmountProps> {
  static readonly MINIMUM = 100;

  private constructor(props: MonthlyAmountProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  static create(amount: number): MonthlyAmount {
    if (amount < MonthlyAmount.MINIMUM) {
      throw new DomainError(
        `Monthly amount must be at least R$ ${MonthlyAmount.MINIMUM}, got R$ ${amount}`,
      );
    }
    return new MonthlyAmount({ value: amount });
  }
}
