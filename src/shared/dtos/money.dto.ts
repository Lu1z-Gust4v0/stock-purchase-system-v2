import { ApiProperty } from '@nestjs/swagger';

export class MoneyDto {
  @ApiProperty({ example: 1000 })
  amount!: number;

  @ApiProperty({ example: 'BRL' })
  currency!: string;
}
