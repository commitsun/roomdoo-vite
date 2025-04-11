import type { ActionTree } from 'vuex';
import { api } from '@/plugins/axios';
import type { AxiosResponse } from 'axios';
import type { CashRegisterInterface } from 'src/interfaces/CashRegisterInterface';
import type { PayloadActionCash } from 'src/interfaces/PayloadActionCash';
import type { CashRegisterResultInterface } from 'src/interfaces/CashRegisterResultInterface';
import type { StateInterface } from '../index';
import type { CashRegisterStateInterface } from '.';

const actions: ActionTree<CashRegisterStateInterface, StateInterface> = {
  async fetchCashRegister(context, journalId: number) {
    return api
      .get(`/transactions/cash-register?journalId=${journalId}`)
      .then((response: AxiosResponse<CashRegisterInterface[]>) => {
        if (Object.keys(response.data).length === 0) {
          context.commit('SET_CASH_REGISTER', null);
        } else {
          context.commit('SET_CASH_REGISTER', response.data);
        }
      });
  },
  async actionCash(context, payload: PayloadActionCash) {
    return api
      .post('/transactions/cash-register', payload)
      .then((response: AxiosResponse<CashRegisterResultInterface>) => {
        context.commit('SET_CASH_REGISTER_RESULT', response.data);
      });
  },
};

export default actions;
