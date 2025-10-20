export interface BoardServiceInterface {
  id: number;
  name: string;
  boardServiceId: number;
  roomTypeId: number;
  amount: number;
  productIds: number[];
  pricelistIds: number[];
  isDefaultBoardService: boolean;
}
