import type { AvailabilityPlanInterface } from '@/legacy/interfaces/AvailabilityPlanInterface';
import type { AvailabilityPlanRuleInterface } from '@/legacy/interfaces/AvailabilityPlanRuleInterface';

import type { MutationTree } from 'vuex';
import type { AvailabilityPlanStateInterface } from '.';

const mutation: MutationTree<AvailabilityPlanStateInterface> = {
  SET_AVAILABILITY_PLANS(
    state: AvailabilityPlanStateInterface,
    availabilities: AvailabilityPlanInterface[]
  ) {
    state.availabilityPlans = availabilities;
  },

  SET_AVAILABILITY_PLAN_RULES(
    state: AvailabilityPlanStateInterface,
    availabilityRules: AvailabilityPlanRuleInterface[]
  ) {
    availabilityRules.forEach((line) => {
      line.date = new Date(line.date);
    });
    state.availabilityPlanRules = availabilityRules;
  },

  SET_ACTIVE_AVAILABILITY_PLAN(
    state: AvailabilityPlanStateInterface,
    availabilityPlan: AvailabilityPlanInterface
  ) {
    state.activeAvailabilityPlan = availabilityPlan;
  },

  UPDATE_AVAIL_PLAN_RULE(
    state: AvailabilityPlanStateInterface,
    availPlanRules: AvailabilityPlanRuleInterface
  ) {
    state.availabilityPlanRules.forEach((el) => {
      if (el.roomTypeId === availPlanRules.roomTypeId && el.date === availPlanRules.date) {
        el.availabilityRuleId = Number(availPlanRules.availabilityRuleId);
        el.minStay = Number(availPlanRules.minStay);
        el.quota = Number(availPlanRules.quota);
      }
    });
  },
};

export default mutation;
