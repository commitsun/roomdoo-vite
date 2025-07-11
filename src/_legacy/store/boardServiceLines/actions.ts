import type { ActionTree } from 'vuex';
import type { AxiosResponse } from 'axios';
import type { BoardServiceLineInterface } from '@/_legacy/interfaces/BoardServiceLineInterface';
import { api } from '@/_legacy/http/axios';

import type { StateInterface } from '../index';
import type { BoardServiceLinesStateInterface } from '.';

const actions: ActionTree<BoardServiceLinesStateInterface, StateInterface> = {
  async fetchBoardServiceLines(
    context,
    payload: { pmsPropertyId: number; boardServiceId: number }
  ) {
    return api
      .get(`/board-services/${payload.boardServiceId}/lines?pmsPropertyId=${payload.pmsPropertyId}`)
      .then((response: AxiosResponse<BoardServiceLineInterface[]>) => {
        context.commit('SET_BOARD_SERVICE_LINES', response.data);
      });
  },
};

export default actions;
