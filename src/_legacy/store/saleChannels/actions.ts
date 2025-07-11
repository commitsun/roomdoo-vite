import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { SaleChannelInterface } from '@/_legacy/interfaces/SaleChannelnterface';
import { api } from '@/_legacy/http/axios';

import type { StateInterface } from '../index';
import type { SaleChannelsStateInterface } from '.';

const actions: ActionTree<SaleChannelsStateInterface, StateInterface> = {
  async fetchSaleChannels(context, pmsPropertyId: number) {
    const params = `?pmsPropertyId=${pmsPropertyId}`;
    return api
      .get(`/sale-channels${params}`)
      .then((response: AxiosResponse<SaleChannelInterface[]>) => {
        context.commit('SET_SALE_CHANNELS', response.data);
      });
  },
};

export default actions;
