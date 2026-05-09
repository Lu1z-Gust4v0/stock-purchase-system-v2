export interface BasketItemInput {
  ticker: string;
  allocationPercentage: number;
}

export interface RegisterBasketRequestDto {
  items: BasketItemInput[];
}
