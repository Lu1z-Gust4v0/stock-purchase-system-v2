import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';
import {
  ORDER_REPOSITORY_PORT,
  OrderRepositoryPort,
} from '@/modules/order/application/ports/order-repository.port';
import { OrderRepository } from '@/modules/order/infrastructure/persistence/order.repository';
import { RegisterOrderUseCase } from '@/modules/order/application/use-cases/register-order.usecase';
import { ORDER_API } from '@/modules/order/api/order-api.interface';
import { OrderApi } from '@/modules/order/api/order.api';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: OrderRepository,
    },
    {
      provide: RegisterOrderUseCase,
      useFactory: (repo: OrderRepositoryPort) => new RegisterOrderUseCase(repo),
      inject: [ORDER_REPOSITORY_PORT],
    },
    {
      provide: ORDER_API,
      useFactory: (useCase: RegisterOrderUseCase) => new OrderApi(useCase),
      inject: [RegisterOrderUseCase],
    },
  ],
  exports: [ORDER_API],
})
export class OrderModule {}
