import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { AgencyInterface } from '@/interfaces/AgencyInterface';
import { api } from '@/plugins/axios';

import type { StateInterface } from '../index';
import type { AgenciesStateInterface } from '.';

const actions: ActionTree<AgenciesStateInterface, StateInterface> = {
  async fetchAgencies(context, pmsPropertyId: number) {
    return api
      .get(`/agencies?pmsPropertyId=${pmsPropertyId}`)
      .then((response: AxiosResponse<AgencyInterface[]>) => {
        context.commit('SET_AGENCIES', response.data);
      });
  },
};

export default actions;
