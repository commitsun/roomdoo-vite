export interface ServiceLineInterface {
  priceUnit: number;
  date: Date | string;
  quantity: number;
  discount: number;
  discountPrice?: number;
  id?: number;
}
export interface ServiceLineApiInterface extends ServiceLineInterface {
  date: string;
}
