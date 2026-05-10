import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { GraphicalAccountRepositoryPort } from '@/modules/custody/application/ports/graphical-account-repository.port';
import { GraphicalAccount } from '@/modules/custody/domain/graphical-account.entity';
import { GraphicalAccountMapper } from '../mappers/graphical-account.mapper';

@Injectable()
export class GraphicalAccountRepository implements GraphicalAccountRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(account: GraphicalAccount): Promise<void> {
    await this.prisma.graphicalAccount.create({
      data: {
        id: account.id,
        clientId: account.clientId,
        account: account.account,
        type: account.type,
        createdAt: account.createdAt,
      },
    });
  }

  async findByClientId(clientId: string): Promise<GraphicalAccount | null> {
    const record = await this.prisma.graphicalAccount.findUnique({
      where: { clientId },
    });
    return record ? GraphicalAccountMapper.toDomain(record) : null;
  }

  async findMasterAccount(): Promise<GraphicalAccount | null> {
    const record = await this.prisma.graphicalAccount.findFirst({
      where: { type: 'MASTER' },
    });
    return record ? GraphicalAccountMapper.toDomain(record) : null;
  }
}
