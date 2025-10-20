import type { ActionTree } from 'vuex';
import { api } from '@/_legacy/http/axios';
import type { StateInterface } from '../index';
import type { PaymentTermStateInterface } from '.';

const actions: ActionTree<PaymentTermStateInterface, StateInterface> = {
  async fetchPaymentTerms(context) {
    return api.get('/payment-terms').then((response) => {
      context.commit('SET_TRANSACTION_TERMS', response.data);
    });
  },
};

export default actions;
