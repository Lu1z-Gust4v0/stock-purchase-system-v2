import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ExecutePurchaseUseCase } from '../../application/use-cases/execute-purchase.use-case';
import { ExecutePurchaseRequestDto } from '../../application/dtos/execute-purchase-request.dto';

@Controller('purchase-engine')
export class PurchaseEngineController {
  constructor(
    private readonly executePurchaseUseCase: ExecutePurchaseUseCase,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.NO_CONTENT)
  async execute(@Body() dto: ExecutePurchaseRequestDto): Promise<void> {
    return this.executePurchaseUseCase.execute(new Date(dto.referenceDate));
  }
}
