import type { ServiceLineInterface } from './ServiceLineInterface';

export interface ServiceInterface {
  productId: number;
  isBoardService: boolean;
  boardServiceLineId?: number;
  reservationId?: number;
  id?: number;
  name?: string;
  quantity?: number;
  priceTotal?: number;
  priceSubtotal?: number;
  priceTaxes?: number;
  discount?: number;
  serviceLines: ServiceLineInterface[];
  isCancelPenalty: boolean;
  items?: ServiceLineInterface[];
}
