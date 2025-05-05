import type { Module } from 'vuex';
import type { InvoiceInterface } from '@/legacy/interfaces/InvoiceInterface';
import type { StateInterface } from '..';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface InvoicesStateInterface {
  invoices: InvoiceInterface[];
  total: number;
  totalInvoices: number;
}

const invoicesModule: Module<InvoicesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default invoicesModule;
