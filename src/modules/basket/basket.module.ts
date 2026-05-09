import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';
import { EventBusModule } from '@/shared/infrastructure/events/event-bus.module';
import { BASKET_REPOSITORY_PORT, BasketRepositoryPort } from '@/modules/basket/application/ports/basket-repository.port';
import { EVENT_BUS_PORT, EventBusPort } from '@/shared/events/event-bus.interface';
import { BasketRepository } from '@/modules/basket/infrastructure/persistence/basket.repository';
import { AdminBasketController } from '@/modules/basket/infrastructure/web/admin-basket.controller';
import { RegisterBasketUseCase } from '@/modules/basket/application/use-cases/register-basket.use-case';
import { GetCurrentBasketUseCase } from '@/modules/basket/application/use-cases/get-current-basket.use-case';
import { ListBasketHistoryUseCase } from '@/modules/basket/application/use-cases/list-basket-history.use-case';
import { BASKET_API } from '@/modules/basket/api/basket-api.interface';
import { BasketApi } from '@/modules/basket/api/basket.api';

@Module({
  imports: [PrismaModule, EventBusModule],
  controllers: [AdminBasketController],
  providers: [
    {
      provide: BASKET_REPOSITORY_PORT,
      useClass: BasketRepository,
    },
    {
      provide: RegisterBasketUseCase,
      useFactory: (repo: BasketRepositoryPort, eventBus: EventBusPort) =>
        new RegisterBasketUseCase(repo, eventBus),
      inject: [BASKET_REPOSITORY_PORT, EVENT_BUS_PORT],
    },
    {
      provide: GetCurrentBasketUseCase,
      useFactory: (repo: BasketRepositoryPort) =>
        new GetCurrentBasketUseCase(repo),
      inject: [BASKET_REPOSITORY_PORT],
    },
    {
      provide: ListBasketHistoryUseCase,
      useFactory: (repo: BasketRepositoryPort) =>
        new ListBasketHistoryUseCase(repo),
      inject: [BASKET_REPOSITORY_PORT],
    },
    {
      provide: BASKET_API,
      useClass: BasketApi,
    },
  ],
  exports: [BASKET_API],
})
export class BasketModule {}
