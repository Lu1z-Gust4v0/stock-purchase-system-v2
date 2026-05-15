import { Money } from '@/shared/domain/money.vo';
import { Distribution } from '../../domain/distribution.entity';

export const DISTRIBUTION_REPOSITORY_PORT = Symbol(
  'DISTRIBUTION_REPOSITORY_PORT',
);

export interface DistributionRepositoryPort {
  save(distribution: Distribution): Promise<void>;

  getTotalDistributionVolumeByAccountId(accountId: string): Promise<Money>;
}
