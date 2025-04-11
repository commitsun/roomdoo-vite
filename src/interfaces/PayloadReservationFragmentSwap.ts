export interface PayloadReservationFragmentSwap {
  pmsPropertyId: number;
  roomId: number;
  date: Date;
  targetReservationLineIds: number[];
  affectedReservationLineIds: number[];
}
