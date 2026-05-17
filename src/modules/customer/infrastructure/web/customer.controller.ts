import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CUSTOMER_API,
  type CustomerApiInterface,
} from '../../api/customer-api.interface';
import { CreateCustomerRequest } from './requests/create-customer.request';
import { UpdateMonthlyDepositRequest } from './requests/update-monthly-deposit.request';
import { CustomerResponse, CustomerResponseMapper } from './responses/customer.response';
import {
  CustomerPortfolioResponse,
  CustomerPortfolioResponseMapper,
} from './responses/customer-portfolio.response';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(
    @Inject(CUSTOMER_API)
    private readonly customerApi: CustomerApiInterface,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, type: CustomerResponse })
  async createCustomer(
    @Body() body: CreateCustomerRequest,
  ): Promise<CustomerResponse> {
    const result = await this.customerApi.createCustomer(body);
    return CustomerResponseMapper.toResponse(result);
  }

  @Patch(':id/monthly-deposit')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update customer monthly deposit amount' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 204, description: 'Updated successfully' })
  async updateMonthlyDeposit(
    @Param('id') id: string,
    @Body() body: UpdateMonthlyDepositRequest,
  ): Promise<void> {
    return this.customerApi.updateCustomerDeposit(id, body.monthlyDeposit);
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 204, description: 'Deactivated successfully' })
  async deactivateCustomer(@Param('id') id: string): Promise<void> {
    return this.customerApi.disableCustomer(id);
  }

  @Get(':id/portfolio')
  @ApiOperation({ summary: 'Get customer portfolio summary' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, type: CustomerPortfolioResponse })
  async getCustomerPortfolio(
    @Param('id') id: string,
  ): Promise<CustomerPortfolioResponse> {
    const result = await this.customerApi.getCustomerPortfolio(id);
    return CustomerPortfolioResponseMapper.toResponse(result);
  }
}
