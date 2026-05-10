import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  CUSTOMER_API,
  type CustomerApiInterface,
} from '../../api/customer-api.interface';
import type { CreateCustomerRequestDto } from '../../application/dtos/create-customer-request.dto';
import type { CustomerResponseDto } from '../../application/dtos/customer-response.dto';

@Controller('customers')
export class CustomerController {
  constructor(
    @Inject(CUSTOMER_API)
    private readonly customerApi: CustomerApiInterface,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCustomer(
    @Body() body: CreateCustomerRequestDto,
  ): Promise<CustomerResponseDto> {
    return this.customerApi.createCustomer(body);
  }

  @Patch(':id/monthly-deposit')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMonthlyDeposit(
    @Param('id') id: string,
    @Body() body: { monthlyDeposit: number },
  ): Promise<void> {
    return this.customerApi.updateCustomerDeposit(id, body.monthlyDeposit);
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateCustomer(@Param('id') id: string): Promise<void> {
    return this.customerApi.disableCustomer(id);
  }
}
