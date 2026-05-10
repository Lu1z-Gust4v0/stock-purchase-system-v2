import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '@/shared/kernel/aggregate-root';
import { AssetPosition } from '@/modules/custody/domain/asset-position.entity';
import { CurrencyPosition } from './currency-position.entity';
import { CustodyEvent } from './custody-event.entity';

export class AccountCustody extends AggregateRoot<string> {
  private readonly _graphicalAccountId: string;
  private _positions: AssetPosition[];
  private readonly _currency: CurrencyPosition;
  private readonly _custodyEvents: CustodyEvent[];

  private constructor(
    id: string,
    graphicalAccountId: string,
    positions: AssetPosition[],
    currency: CurrencyPosition,
    custodyEvents: CustodyEvent[],
  ) {
    super(id);
    this._graphicalAccountId = graphicalAccountId;
    this._positions = positions;
    this._currency = currency;
    this._custodyEvents = custodyEvents;
  }

  get graphicalAccountId(): string {
    return this._graphicalAccountId;
  }
  get positions(): AssetPosition[] {
    return [...this._positions];
  }
  get currency(): CurrencyPosition {
    return this._currency;
  }
  get custodyEvents(): CustodyEvent[] {
    return [...this._custodyEvents];
  }

  static create(
    graphicalAccountId: string,
    currency: CurrencyPosition,
  ): AccountCustody {
    return new AccountCustody(
      randomUUID(),
      graphicalAccountId,
      [],
      currency,
      [],
    );
  }

  static reconstitute(
    id: string,
    graphicalAccountId: string,
    positions: AssetPosition[],
    currency: CurrencyPosition,
    custodyEvents: CustodyEvent[] = [],
  ): AccountCustody {
    return new AccountCustody(
      id,
      graphicalAccountId,
      positions,
      currency,
      custodyEvents,
    );
  }

  upsertPosition(position: AssetPosition): void {
    const index = this._positions.findIndex(
      (p) => p.ticker === position.ticker,
    );
    if (index >= 0) {
      this._positions[index] = position;
    } else {
      this._positions.push(position);
    }
  }

  getPosition(ticker: string): AssetPosition | undefined {
    return this._positions.find((p) => p.ticker === ticker);
  }

  addCustodyEvent(event: CustodyEvent): void {
    this._custodyEvents.push(event);
  }
}
