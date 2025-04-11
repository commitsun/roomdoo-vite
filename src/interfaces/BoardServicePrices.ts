import type { PriceInterface } from './PriceInterface';

export interface BoardServicePrices {
  name: string;
  productId: number;
  boardServiceId: number;
  boardServiceLineId: number;
  isAdults: boolean;
  isChildren: boolean;
  prices: PriceInterface[];
}
