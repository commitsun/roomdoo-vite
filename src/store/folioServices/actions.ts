import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { ServiceInterface } from 'src/interfaces/ServiceInterface';
import { api } from '@/plugins/axios';

import type { StateInterface } from '../index';
import type { FolioServicesStateInterface } from '.';

const actions: ActionTree<FolioServicesStateInterface, StateInterface> = {
  async fetchFolioServices(context, folioId: number) {
    return api
      .get(`/folios/${folioId}/services`)
      .then((response: AxiosResponse<ServiceInterface[]>) => {
        context.commit('SET_FOLIO_SERVICES', response.data);
      });
  },
};

export default actions;
