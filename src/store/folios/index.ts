import type { Module } from 'vuex';
import type { FolioInterface } from 'src/interfaces/FolioInterface';
import type { TransactionInterface } from 'src/interfaces/TransactionInterface';
import type { FolioSaleLineInterface } from 'src/interfaces/FolioSaleLineInterface';
import type { InvoiceInterface } from 'src/interfaces/InvoiceInterface';
import type { FolioFilters } from 'src/interfaces/FolioFilters';
import type { FolioMessageInterface, MessageInterface } from 'src/interfaces/FolioMessageInterface';

import type { CheckinPartnerInterface } from 'src/interfaces/CheckinPartnerInterface';
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
