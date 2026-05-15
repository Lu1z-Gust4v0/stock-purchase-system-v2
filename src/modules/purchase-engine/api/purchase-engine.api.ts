import { Injectable } from '@nestjs/common';
import { Money } from '@/shared/domain/money.vo';
import { type DistributionRepositoryPort } from '../application/ports/distribution-repository.port';
import { PurchaseEngineApiInterface } from './purchase-engine-api.interface';

@Injectable()
export class PurchaseEngineApi implements PurchaseEngineApiInterface {
  constructor(
    private readonly distributionRepo: DistributionRepositoryPort,
  ) {}

  async getTotalDistributionVolumeByAccountId(
    accountId: string,
  ): Promise<Money> {
    return this.distributionRepo.getTotalDistributionVolumeByAccountId(
      accountId,
    );
  }
}
