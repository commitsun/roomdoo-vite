import { type PlanningReservationLineInterface } from './PlanningReservationLineInterface';

export interface PayloadReservationLineChangeInterface {
  reservationLines: PlanningReservationLineInterface[];
  roomIdTarget: number;
  dateTarget: Date;
  moreDays: number;
}
