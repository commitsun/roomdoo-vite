import type { Module } from 'vuex';
import type { AvailabilityPlanInterface } from '@/_legacy/interfaces/AvailabilityPlanInterface';
import type { AvailabilityPlanRuleInterface } from '@/_legacy/interfaces/AvailabilityPlanRuleInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface AvailabilityPlanStateInterface {
  availabilityPlans: AvailabilityPlanInterface[];
  activeAvailabilityPlan: AvailabilityPlanInterface | null;
  availabilityPlanRules: AvailabilityPlanRuleInterface[];
}
const availabilityPlansModule: Module<AvailabilityPlanStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default availabilityPlansModule;
