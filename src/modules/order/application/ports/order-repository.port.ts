import { Order } from '../../domain/order.entity';

export const ORDER_REPOSITORY_PORT = Symbol('ORDER_REPOSITORY_PORT');

export interface OrderRepositoryPort {
  save(order: Order): Promise<void>;
}
