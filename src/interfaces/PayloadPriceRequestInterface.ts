export interface PayloadPriceRequestInterface {
  pmsPropertyId: number;
  pricelistId: number;
  roomTypeId?: number;
  productId?: number;
  boardServiceId?: number;
  boardServiceLineId?: number;
  dateFrom: Date;
  dateTo: Date;
  isAdults: boolean;
  isChildren: boolean;
}
