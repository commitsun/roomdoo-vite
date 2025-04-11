export interface PayloadReservationCreation {
  reservationId: number;
  date: Date;
  price: number;
  discount: number;
  roomId: number;
  pmsPropertyId: number;
}
