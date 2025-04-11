import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import { api } from '@/plugins/axios';
import type { AvailabilityPlanInterface } from '@/interfaces/AvailabilityPlanInterface';
import type { AvailabilityPlanRuleInterface } from '@/interfaces/AvailabilityPlanRuleInterface';

import type { PayloadAvailabilityPlanRuleInterface } from '@/interfaces/PayloadAvailabilityPlanRuleInterface';
import type { StateInterface } from '../index';
import type { AvailabilityPlanStateInterface } from '.';

const actions: ActionTree<AvailabilityPlanStateInterface, StateInterface> = {
  async fetchAvailabilityPlans(context, pmsPropertyId: number) {
    return api.get(`/availability-plans?pmsPropertyId=${pmsPropertyId}`).then((response) => {
      context.commit('SET_AVAILABILITY_PLANS', response.data);
    });
  },
  async fetchAvailabilityPlanRules(context, payload: PayloadAvailabilityPlanRuleInterface) {
    let to = '';
    let from = '';
    let params = '';
    if (payload.dateFrom && payload.dateTo) {
      from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
      to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
      params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.propertyId}`;
    }
    return api
      .get(`/availability-plans/${payload.availabilityPlanId}/availability-plan-rules${params}`)
      .then((response: AxiosResponse<AvailabilityPlanRuleInterface[]>) => {
        context.commit('SET_AVAILABILITY_PLAN_RULES', response.data);
      });
  },
  setActiveAvailabilityPlan(context, availabilityPlan: AvailabilityPlanInterface) {
    context.commit('SET_ACTIVE_AVAILABILITY_PLAN', availabilityPlan);
  },
  async createAvailabilityPlanRule(context, payload: AvailabilityPlanRuleInterface) {
    let availPlanId = '';
    if (context.state.activeAvailabilityPlan) {
      availPlanId = context.state.activeAvailabilityPlan.id?.toString() ?? '';
    }
    return api
      .post(`/availability-plans/${availPlanId}/availability-plan-rules`, payload)
      .then(() => {
        context.commit('UPDATE_AVAIL_PLAN_RULE', payload);
      });
  },
  createAvailabilityPlanRuleToSave(context, payload: []) {
    context.commit('ADD_NEW_AVAILABILITY_PLAN_RULE_TO_SAVE', payload);
  },
  async createOrUpdateAvailabilityPlanRules(
    _context,
    payload: { availabilityPlanId: number; availabilityPlanRules: AvailabilityPlanRuleInterface[] }
  ) {
    return api.patch(
      `/availability-plans/p/${payload.availabilityPlanId}/availability-plan-rules`,
      payload
    );
  },
  async batchChangesAvailabilityPlanRules(
    _context,
    payload: {
      availabilityPlanRules: AvailabilityPlanRuleInterface[];
    }
  ) {
    return api.post('/availability-plans/batch-changes', payload);
  },
};

export default actions;
