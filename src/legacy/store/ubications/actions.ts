import type { ActionTree } from 'vuex';

import { api } from '@/legacy/http/axios';
import type { StateInterface } from '../index';
import type { UbicationStateInterface } from '.';

const actions: ActionTree<UbicationStateInterface, StateInterface> = {
  async fetchUbications(context, propertyId: number) {
    return api.get(`/ubications?pmsPropertyIds[]=${propertyId.toString()}`).then((response) => {
      context.commit('SET_UBICATIONS', response.data);
    });
  },
};

export default actions;
