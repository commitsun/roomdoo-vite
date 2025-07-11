import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { BoardServiceInterface } from '@/_legacy/interfaces/BoardServiceInterface';
import { api } from '@/_legacy/http/axios';
import type { StateInterface } from '../index';
import type { BoardServicesStateInterface } from '.';

const actions: ActionTree<BoardServicesStateInterface, StateInterface> = {
  async fetchBoardServices(context, pmsPropertyId: number) {
    return api
      .get(`/board-services?pmsPropertyId=${pmsPropertyId}`)
      .then((response: AxiosResponse<BoardServiceInterface[]>) => {
        context.commit('SET_BOARD_SERVICES', response.data);
      });
  },
};

export default actions;
