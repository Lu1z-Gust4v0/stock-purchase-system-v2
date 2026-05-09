import { AggregateRoot } from '../../shared/kernel/aggregate-root';
import { AssetPosition } from './asset-position.entity';

export class MasterCustody extends AggregateRoot<string> {
  private _positions: AssetPosition[];

  private constructor(id: string, positions: AssetPosition[]) {
    super(id);
    this._positions = positions;
  }

  get positions(): AssetPosition[] {
    return [...this._positions];
  }

  static create(id: string): MasterCustody {
    return new MasterCustody(id, []);
  }

  static reconstitute(id: string, positions: AssetPosition[]): MasterCustody {
    return new MasterCustody(id, positions);
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
