export interface ReservationLineInterface {
  date: Date | string;
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

export interface ReservationLineApiInterface extends ReservationLineInterface {
  date: string;
}
