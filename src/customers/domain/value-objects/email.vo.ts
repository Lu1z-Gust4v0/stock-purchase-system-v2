import { ValueObject } from '../../../shared/kernel/value-object';
import { DomainException } from '../../../shared/exceptions/domain.exception';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(email: string): Email {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new DomainException(`Invalid email: ${email}`);
    }
    return new Email({ value: email.toLowerCase() });
  }
}
