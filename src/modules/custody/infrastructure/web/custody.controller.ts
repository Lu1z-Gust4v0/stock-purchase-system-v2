import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAccountCustodyUseCase } from '../../application/use-cases/get-account-custody.usecase';
import { GetAccountCustodyResponseMapper } from '../../application/dtos/get-account-custody-response.dto';
import {
  AccountCustodyResponse,
  AccountCustodyResponseMapper,
} from './responses/account-custody.response';

@ApiTags('Custody')
@Controller('custody')
export class CustodyController {
  constructor(
    private readonly getAccountCustodyUseCase: GetAccountCustodyUseCase,
  ) {}

  @Get(':accountId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get account custody positions and balance' })
  @ApiParam({ name: 'accountId', description: 'Brokerage account ID' })
  @ApiResponse({ status: 200, type: AccountCustodyResponse })
  async getAccountCustody(
    @Param('accountId') accountId: string,
  ): Promise<AccountCustodyResponse> {
    const custody = await this.getAccountCustodyUseCase.execute(accountId);
    const dto = GetAccountCustodyResponseMapper.toResponse(custody);
    return AccountCustodyResponseMapper.toResponse(dto);
  }
}
