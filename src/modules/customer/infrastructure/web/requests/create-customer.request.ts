import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerRequest {
  @ApiProperty({ example: 'João da Silva' })
  name!: string;

  @ApiProperty({ example: '123.456.789-00', description: 'CPF or CNPJ' })
  mainDocumentCode!: string;

  @ApiProperty({ example: 'joao@example.com' })
  email!: string;

  @ApiProperty({ example: 1000, description: 'Monthly deposit amount in BRL' })
  monthlyDeposit!: number;
}
