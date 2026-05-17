import { ApiProperty } from '@nestjs/swagger';

export class UpdateMonthlyDepositRequest {
  @ApiProperty({
    example: 1500.0,
    description: 'New monthly deposit amount in BRL',
  })
  monthlyDeposit!: number;
}
