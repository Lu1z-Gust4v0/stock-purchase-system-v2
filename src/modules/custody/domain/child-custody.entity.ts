import { AggregateRoot } from '@/shared/kernel/aggregate-root';
import { AssetPosition } from '@/modules/custody/domain/asset-position.entity';

export class ChildCustody extends AggregateRoot<string> {
  private readonly _customerId: string;
  private _positions: AssetPosition[];

  private constructor(
    id: string,
    customerId: string,
    positions: AssetPosition[],
  ) {
    super(id);
    this._customerId = customerId;
    this._positions = positions;
  }

  get customerId(): string {
    return this._customerId;
  }
  get positions(): AssetPosition[] {
    return [...this._positions];
  }

  static create(id: string, customerId: string): ChildCustody {
    return new ChildCustody(id, customerId, []);
  }

  static reconstitute(
    id: string,
    customerId: string,
    positions: AssetPosition[],
  ): ChildCustody {
    return new ChildCustody(id, customerId, positions);
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
}
