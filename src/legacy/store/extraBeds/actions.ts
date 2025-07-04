import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { ExtraBedInterface } from '@/legacy/interfaces/ExtraBedInterface';
import type { ExtraBedsPayloadInterface } from '@/legacy/interfaces/ExtraBedsPayloadInterface';
import { api } from '@/legacy/http/axios';

import type { StateInterface } from '../index';
import type { ExtraBedsStateInterface } from '.';

const actions: ActionTree<ExtraBedsStateInterface, StateInterface> = {
  async fetchExtraBeds(context, payload: ExtraBedsPayloadInterface) {
    let params = '';
    const from = `${payload.dateFrom.getFullYear()}-${(payload.dateFrom.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateFrom.getDate().toString().padStart(2, '0')}`;
    const to = `${payload.dateTo.getFullYear()}-${(payload.dateTo.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${payload.dateTo.getDate().toString().padStart(2, '0')}`;
    params = `?dateFrom=${from}&dateTo=${to}&pmsPropertyId=${payload.pmsPropertyId}`;

    return api.get(`/extra-beds${params}`).then((response: AxiosResponse<ExtraBedInterface[]>) => {
      context.commit('SET_EXTRA_BEDS', response.data);
    });
  },
};

export default actions;
