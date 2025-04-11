import type { Module } from 'vuex';
import type { FolioInterface } from '@/interfaces/FolioInterface';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';
import type { FolioSaleLineInterface } from '@/interfaces/FolioSaleLineInterface';
import type { InvoiceInterface } from '@/interfaces/InvoiceInterface';
import type { FolioFilters } from '@/interfaces/FolioFilters';
import type { FolioMessageInterface, MessageInterface } from '@/interfaces/FolioMessageInterface';

import type { CheckinPartnerInterface } from '@/interfaces/CheckinPartnerInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface FoliosStateInterface {
  currentFolio: FolioInterface | null;
  folios: FolioInterface[];
  foliosPlanning: FolioInterface[];
  transactions: TransactionInterface[];
  saleLines: FolioSaleLineInterface[];
  invoices: InvoiceInterface[];
  lastFolioFilters: FolioFilters | null;
  folioMessages: FolioMessageInterface | null;
  messages: MessageInterface | null;
  adultsInFolio: CheckinPartnerInterface[];
}

const foliosModule: Module<FoliosStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default foliosModule;
