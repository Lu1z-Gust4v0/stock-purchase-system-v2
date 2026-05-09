import { ValueObject } from '@/shared/kernel/value-object';
import { DomainException } from '@/shared/exceptions/domain.exception';

interface TaxIdProps {
  value: string;
}

export class TaxId extends ValueObject<TaxIdProps> {
  private constructor(props: TaxIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(cpf: string): TaxId {
    const digits = cpf.replace(/\D/g, '');
    if (!TaxId.isValid(digits)) {
      throw new DomainException(`Invalid CPF: ${cpf}`);
    }
    return new TaxId({ value: digits });
  }

  private static isValid(digits: string): boolean {
    if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    if (remainder !== parseInt(digits[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    return remainder === parseInt(digits[10]);
  }
}
