import type { Module } from 'vuex';
import type { PartnerInterface } from '@/interfaces/PartnerInterface';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';
import type { InvoiceInterface } from '@/interfaces/InvoiceInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface PartnerStateInterface {
  partners: PartnerInterface[];
  totalPartners: number;
  currentPartner: PartnerInterface | null;
  currentPartnerTransactions: TransactionInterface[];
  currentPartnerInvoices: InvoiceInterface[];
}

const partnersModule: Module<PartnerStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default partnersModule;
