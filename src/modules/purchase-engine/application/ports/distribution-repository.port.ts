import { Distribution } from '../../domain/distribution.entity';

export interface DistributionRepositoryPort {
  save(distribution: Distribution): Promise<void>;
}
