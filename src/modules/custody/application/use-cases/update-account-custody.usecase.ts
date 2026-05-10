import { Injectable } from '@nestjs/common';
import type { CustodyRepositoryPort } from '../ports/custody-repository.port';
import {
  UpdateAccountCustodyRequestDto,
  UpdateAccountCustodyRequestMapper,
} from '../ports/update-account-custody-request.dto';
import { DomainError } from '@/shared/errors/domain.exception';

@Injectable()
export class UpdateAccountCustodyUseCase {
  constructor(private readonly custodyRepo: CustodyRepositoryPort) {}

  async execute(dto: UpdateAccountCustodyRequestDto): Promise<void> {
    const custody = await this.custodyRepo.findByAccountId(
      dto.graphicalAccountId,
    );

    if (!custody) {
      throw new DomainError('Graphical account not found', 404);
    }

    const events = UpdateAccountCustodyRequestMapper.toCustodyEvents(dto);

    events.forEach((event) => custody.applyCustodyEvent(event));

    custody.updateBalance(dto.newBalance);

    await this.custodyRepo.save(custody);
  }
}
