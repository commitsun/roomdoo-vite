import type { Module } from 'vuex';
import type { PaymentTermInterface } from 'src/interfaces/PaymentTermInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface PaymentTermStateInterface {
  paymentTerms: PaymentTermInterface[];
}

const paymentTermsModule: Module<PaymentTermStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default paymentTermsModule;
