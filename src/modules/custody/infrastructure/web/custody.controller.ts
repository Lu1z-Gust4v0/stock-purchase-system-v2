import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { GetAccountCustodyUseCase } from '../../application/use-cases/get-account-custody.usecase';
import {
  GetAccountCustodyResponseDto,
  GetAccountCustodyResponseMapper,
} from '../../application/dtos/get-account-custody-response.dto';

@Controller('custody')
export class CustodyController {
  constructor(
    private readonly getAccountCustodyUseCase: GetAccountCustodyUseCase,
  ) {}

  @Get(':accountId')
  @HttpCode(HttpStatus.OK)
  async getAccountCustody(
    @Param('accountId') accountId: string,
  ): Promise<GetAccountCustodyResponseDto> {
    const custody = await this.getAccountCustodyUseCase.execute(accountId);
    return GetAccountCustodyResponseMapper.toResponse(custody);
  }
}
