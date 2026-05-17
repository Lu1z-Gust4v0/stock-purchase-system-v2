import { ApiProperty } from '@nestjs/swagger';

export class ExecutePurchaseRequest {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Reference date for the purchase execution (ISO 8601)',
  })
  referenceDate!: string;
}
