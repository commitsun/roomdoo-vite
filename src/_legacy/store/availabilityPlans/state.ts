import type { AvailabilityPlanStateInterface } from '.';

function state(): AvailabilityPlanStateInterface {
  return {
    availabilityPlans: [],
    activeAvailabilityPlan: null,
    availabilityPlanRules: [],
  };
}

export default state;
