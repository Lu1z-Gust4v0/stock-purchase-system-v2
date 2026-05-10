import { ValueObject } from '@/shared/kernel/value-object';
import { DomainError } from '@/shared/errors/domain.exception';

interface MainDocumentCodeProps {
  value: string;
}

export class MainDocumentCode extends ValueObject<MainDocumentCodeProps> {
  private constructor(props: MainDocumentCodeProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(cpf: string): MainDocumentCode {
    const digits = cpf.replaceAll(/\D/g, '');
    if (!MainDocumentCode.isValid(digits)) {
      throw new DomainError(`Invalid CPF: ${cpf}`);
    }
    return new MainDocumentCode({ value: digits });
  }

  private static isValid(digits: string): boolean {
    if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number.parseInt(digits[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    if (remainder !== Number.parseInt(digits[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number.parseInt(digits[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    return remainder === Number.parseInt(digits[10]);
  }
}
