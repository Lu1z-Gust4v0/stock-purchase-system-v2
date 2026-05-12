import { Money } from '@/shared/domain/money.vo';
import {
  CustodyEvent,
  CustodyEventType,
} from '../../domain/custody-event.entity';

export interface CustodyChange {
  type: CustodyEventType;
  ticker: string;
  quantity: number;
  unitaryPrice: Money;
  profit: Money;
}

export interface UpdateAccountCustodyRequestDto {
  graphicalAccountId: string;
  changes: CustodyChange[];
  newBalance?: Money;
}

export class UpdateAccountCustodyRequestMapper {
  static toCustodyEvents(dto: UpdateAccountCustodyRequestDto): CustodyEvent[] {
    return dto.changes.map((change) =>
      CustodyEvent.create({
        graphicalAccountId: dto.graphicalAccountId,
        profit: change.profit,
        quantity: change.quantity,
        ticker: change.ticker,
        type: change.type,
        unitaryPrice: change.unitaryPrice,
      }),
    );
  }
}
