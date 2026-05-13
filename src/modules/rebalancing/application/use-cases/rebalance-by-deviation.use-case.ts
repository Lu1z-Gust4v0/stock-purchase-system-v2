import { Injectable } from '@nestjs/common';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { OrderApiInterface } from '@/modules/order/api/order-api.interface';
import { ByDeviationCalculator } from '../../domain/services/by-deviation-calculator.service';
import { RebalanceByDeviationRequestDto } from '../dtos/rebalance-by-deviation-request.dto';

@Injectable()
export class RebalanceByDeviationUseCase {
  constructor(
    private readonly byDeviationCalculator: ByDeviationCalculator,
    private readonly custodyApi: CustodyApiInterface,
    private readonly orderApi: OrderApiInterface,
  ) {}

  async execute(dto: RebalanceByDeviationRequestDto): Promise<void> {
    const { accountCustody } = dto;

    const { orders, changes, leftovers } =
      await this.byDeviationCalculator.calculate(dto);

    // No rebalance needed for client, all stocks within threshold
    if (!orders.length) return;

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
