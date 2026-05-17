import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExecutePurchaseUseCase } from '../../application/use-cases/execute-purchase.use-case';
import { ExecutePurchaseRequest } from './requests/execute-purchase.request';

@ApiTags('Purchase Engine')
@Controller('purchase-engine')
export class PurchaseEngineController {
  constructor(
    private readonly executePurchaseUseCase: ExecutePurchaseUseCase,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Trigger the purchase execution for a reference date' })
  @ApiResponse({ status: 204, description: 'Purchase executed successfully' })
  async execute(@Body() dto: ExecutePurchaseRequest): Promise<void> {
    return this.executePurchaseUseCase.execute(new Date(dto.referenceDate));
  }
}
