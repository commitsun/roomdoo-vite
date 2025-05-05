import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { AxiosResponse } from 'axios';
import type { TransactionMethodInterface } from '@/legacy/interfaces/TransactionMethodInterface';
import type { StateInterface } from '../index';
import type { AccountJournalsStateInterface } from '.';

const actions: ActionTree<AccountJournalsStateInterface, StateInterface> = {
  async fetchAccountJournals(context, params: { pmsPropertyId: number; roomIds?: number[] }) {
    let accountParams = `?pmsPropertyId=${params.pmsPropertyId}`;
    if (params.roomIds) {
      params.roomIds.forEach((el) => {
        accountParams += `&roomIds[]=${el.toString()}`;
      });
    }
    return api
      .get(`/account-journals${accountParams}`)
      .then((response: AxiosResponse<TransactionMethodInterface[]>) => {
        context.commit('SET_ACCOUNT_JOURNALS', response.data);
      });
  },
};

export default actions;
