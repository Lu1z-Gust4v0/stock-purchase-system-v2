import { Money } from '@/shared/domain/money.vo';

export const DISTRIBUTION_REPOSITORY_PORT = Symbol(
  'DISTRIBUTION_REPOSITORY_PORT',
);

export interface SaveDistributionDto {
  id: string;
  amount: Money;
  graphicalAccountId: string;
  createdAt: Date;
}

export interface DistributionRepositoryPort {
  save(dto: SaveDistributionDto): Promise<void>;
  getTotalDistributionVolumeByAccountId(accountId: string): Promise<Money>;
}
