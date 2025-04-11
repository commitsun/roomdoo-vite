import type { PriceInterface } from './PriceInterface';

export interface ExtraServicePrices {
  name: string;
  productId: number;
  perDay: boolean;
  consumedOn: string;
  perPerson: boolean;
  prices: PriceInterface[];
}
