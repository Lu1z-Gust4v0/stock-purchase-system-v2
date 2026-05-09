export interface BasketItemInput {
  ticker: string;
  allocationPercentage: number;
}

export interface RegisterBasketRequestDto {
  name: string;
  items: BasketItemInput[];
}
