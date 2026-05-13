import { Injectable } from '@nestjs/common';
import { RebalanceByBasketChangeRequestDto } from '../dtos/rebalance-by-basket-change-request.dto';
import { ByBasketChangeCalculator } from '../../domain/services/by-basket-change-calculator.service';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';

@Injectable()
export class RebalanceByBasketChangeUseCase {
  constructor(
    private readonly byBasketChangeCalculator: ByBasketChangeCalculator,
    private readonly custodyApi: CustodyApiInterface,
    private readonly orderApi: OrderApiInterface,
  ) {}

  async execute(dto: RebalanceByBasketChangeRequestDto): Promise<void> {
    const { accountCustody } = dto;

    const { orders, changes, leftovers } =
      await this.byBasketChangeCalculator.calculate(dto);

    await this.orderApi.registerOrder({
      brokerageAccountId: accountCustody.graphicalAccountId,
      items: orders,
    });

    await this.custodyApi.updateAccountCustody({
      graphicalAccountId: accountCustody.graphicalAccountId,
      changes: changes,
      newBalance: leftovers,
    });
  }
}
