import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@/shared/dtos/money.dto';
import { CustomerResponseDto } from '@/modules/customer/application/dtos/customer-response.dto';

export class CustomerResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'João da Silva' })
  name!: string;

  @ApiProperty({ example: '123.456.789-00' })
  mainDocumentCode!: string;

  @ApiProperty({ example: 'joao@example.com' })
  email!: string;

  @ApiProperty({ type: MoneyDto })
  monthlyDeposit!: MoneyDto;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: 'ACC-123456' })
  graphicalAccountId!: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt!: string;
}

export class CustomerResponseMapper {
  static toResponse(dto: CustomerResponseDto): CustomerResponse {
    return {
      id: dto.id,
      name: dto.name,
      mainDocumentCode: dto.mainDocumentCode,
      email: dto.email,
      monthlyDeposit: {
        amount: dto.monthlyDeposit.amount,
        currency: dto.monthlyDeposit.currency,
      },
      active: dto.active,
      graphicalAccountId: dto.graphicalAccountId,
      createdAt: dto.createdAt,
    };
  }
}
