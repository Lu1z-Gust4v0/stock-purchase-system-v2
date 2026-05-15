import { Money } from '@/shared/domain/money.vo';

export const PURCHASE_ENGINE_API = Symbol('PURCHASE_ENGINE_API');

export interface PurchaseEngineApiInterface {
  getTotalDistributionVolumeByAccountId(accountId: string): Promise<Money>;
}
