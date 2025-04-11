import type { ReservationInterface } from './ReservationInterface';

export interface ReservationsByCategoryInterface {
  roomTypeClassId: number;
  roomTypeClassName: string;
  reservations: ReservationInterface[];
}
