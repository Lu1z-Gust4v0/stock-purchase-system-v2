import { Entity } from '@/shared/kernel/entity';
import { Money } from '@/shared/domain/money.vo';

export enum RebalancingTrigger {
  BASKET_CHANGE = 'BASKET_CHANGE',
  DEVIATION = 'DEVIATION',
}

export interface RebalancingAction {
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: Money;
}

export class RebalancingLog extends Entity<string> {
  private readonly _customerId: string;
  private readonly _trigger: RebalancingTrigger;
  private readonly _actions: RebalancingAction[];
  private readonly _executedAt: Date;

  private constructor(
    id: string,
    customerId: string,
    trigger: RebalancingTrigger,
    actions: RebalancingAction[],
    executedAt: Date,
  ) {
    super(id);
    this._customerId = customerId;
    this._trigger = trigger;
    this._actions = actions;
    this._executedAt = executedAt;
  }

  get customerId(): string {
    return this._customerId;
  }
  get trigger(): RebalancingTrigger {
    return this._trigger;
  }
  get actions(): RebalancingAction[] {
    return [...this._actions];
  }
  get executedAt(): Date {
    return this._executedAt;
  }

  static create(
    id: string,
    customerId: string,
    trigger: RebalancingTrigger,
    actions: RebalancingAction[],
  ): RebalancingLog {
    return new RebalancingLog(id, customerId, trigger, actions, new Date());
  }

  static reconstitute(
    id: string,
    customerId: string,
    trigger: RebalancingTrigger,
    actions: RebalancingAction[],
    executedAt: Date,
  ): RebalancingLog {
    return new RebalancingLog(id, customerId, trigger, actions, executedAt);
  }
}
