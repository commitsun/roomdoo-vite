export interface PricelistInterface {
  id: number;
  name: string;
  defaultAvailabilityPlanId?: number;
  cancelationRuleId: number;
}
