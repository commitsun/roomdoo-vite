import { type AvailabilityPlanRuleInterface } from './AvailabilityPlanRuleInterface';
import { type PlanningReservationLineInterface } from './PlanningReservationLineInterface';

export interface PlanningRoomsItemInterface {
  date: Date;
  reservationLines?: PlanningReservationLineInterface[];
  restriction?: AvailabilityPlanRuleInterface;
}

export interface PlanningRoomsInterface {
  roomId: number;
  roomTypeId: number;
  dates: PlanningRoomsItemInterface[];
  roomAmenityInName: string;
}
