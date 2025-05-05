export interface ReservationLineInterface {
  date: Date;
  price: number;
  discount: number;
  roomId: number;
  pmsPropertyId: number;

  id?: number;
  discountPrice?: number;
  cancelDiscount?: number;
  reservationId?: number;
  isReselling?: boolean;
}
