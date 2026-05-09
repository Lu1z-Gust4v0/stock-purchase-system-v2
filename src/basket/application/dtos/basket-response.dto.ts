export interface BasketItemDto {
  ticker: string;
  allocationPercentage: number;
}

export interface BasketResponseDto {
  id: string;
  items: BasketItemDto[];
  active: boolean;
  createdAt: Date;
}
