import { BasketResponseDto } from '../application/dtos/basket-response.dto';

export const BASKET_API = Symbol('BASKET_API');

// Public face used by purchase-engine to read the active basket
export interface BasketApiInterface {
  getActiveBasket(): Promise<BasketResponseDto | null>;
}
