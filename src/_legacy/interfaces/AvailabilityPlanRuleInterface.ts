export interface AvailabilityPlanRuleInterface {
  roomTypeId: number;
  date: Date;
  availabilityRuleId: number | null;
  minStay: number | null;
  minStayArrival: number | null;
  maxStay: number | null;
  maxStayArrival: number | null;
  closed: boolean | null;
  closedDeparture: boolean | null;
  closedArrival: boolean | null;
  quota: number | null;
  maxAvailability: number | null;
  availabilityPlanId: number | null;
}
