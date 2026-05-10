import { Custody } from '@/generated/prisma/client';
import { AssetPosition } from '@/modules/custody/domain/asset-position.entity';
import { Money } from '@/shared/domain/money.vo';

export class CustodyMapper {
  static toDomain(record: Custody): AssetPosition {
    return AssetPosition.reconstitute(
      record.id,
      record.code,
      record.quantity,
      Money.fromNumber(Number(record.averagePrice)),
    );
  }
}
