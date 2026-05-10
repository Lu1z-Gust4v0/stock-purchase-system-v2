import { GraphicalAccount } from '../../domain/graphical-account.entity';

export const GRAPHICAL_ACCOUNT_REPOSITORY = Symbol('CUSTODY_REPOSITORY');

export interface GraphicalAccountRepositoryPort {
  save(account: GraphicalAccount): Promise<void>;
  findByClientId(clientId: string): Promise<GraphicalAccount | null>;
  findMasterAccount(): Promise<GraphicalAccount | null>;
}
