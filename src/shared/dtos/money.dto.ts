import { ApiProperty } from '@nestjs/swagger';

export class MoneyDto {
  @ApiProperty({ example: 1000.1234, description: 'Up to 4 decimal places, banker\'s rounding applied' })
  amount!: number;

  @ApiProperty({ example: 'BRL' })
  currency!: string;
}
