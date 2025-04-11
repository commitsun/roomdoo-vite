import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { CancelationRuleInterface } from '@/interfaces/CancelationRuleInterface';
import { api } from '@/plugins/axios';
import type { StateInterface } from '../index';
import type { CancelationRulesStateInterface } from '.';

const actions: ActionTree<CancelationRulesStateInterface, StateInterface> = {
  async fetchCancelationRules(context, pmsPropertyId: number) {
    return api
      .get(`/cancelation-rules?pmsPropertyId=${pmsPropertyId}`)
      .then((response: AxiosResponse<CancelationRuleInterface[]>) => {
        context.commit('SET_CANCELATION_RULES', response.data);
      });
  },
};

export default actions;
