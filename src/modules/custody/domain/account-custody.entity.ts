import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '@/shared/kernel/aggregate-root';
import { AssetPosition } from '@/modules/custody/domain/asset-position.entity';
import { CurrencyPosition } from './currency-position.entity';
import { CustodyEvent } from './custody-event.entity';
import { Money } from '@/shared/domain/money.vo';

export class AccountCustody extends AggregateRoot<string> {
  private readonly _graphicalAccountId: string;
  private readonly _positions: Map<string, AssetPosition>;
  private readonly _currency: CurrencyPosition;
  private readonly _custodyEvents: CustodyEvent[];

  private constructor(
    id: string,
    graphicalAccountId: string,
    positions: Map<string, AssetPosition>,
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
  get positions(): Map<string, AssetPosition> {
    return new Map(this._positions);
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
      new Map(),
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
    const positionsMap = positions.reduce((map, position) => {
      return map.set(position.ticker, position);
    }, new Map());

    return new AccountCustody(
      id,
      graphicalAccountId,
      positionsMap as Map<string, AssetPosition>,
      currency,
      custodyEvents,
    );
  }

  upsertPosition(position: AssetPosition): void {
    this._positions.set(position.ticker, position);
  }

  getPosition(ticker: string): AssetPosition | undefined {
    return this._positions.get(ticker);
  }

  applyCustodyEvent(event: CustodyEvent) {
    this._custodyEvents.push(event);

    const position = this.getPosition(event.ticker);

    if (!position) {
      this._positions.set(
        event.ticker,
        AssetPosition.create(event.ticker, event.quantity, event.unitaryPrice),
      );
      return;
    }

    if (event.quantity > 0) {
      position.addShares(event.quantity, event.unitaryPrice);
    }

    if (event.quantity <= 0) {
      position.removeShares(Math.abs(event.quantity));
    }
  }

  updateBalance(newBalance: Money) {
    this._currency.update(newBalance);
  }
}
