import type { Module } from 'vuex';
import type { FolioInterface } from '@/_legacy/interfaces/FolioInterface';
import type { TransactionInterface } from '@/_legacy/interfaces/TransactionInterface';
import type { FolioSaleLineInterface } from '@/_legacy/interfaces/FolioSaleLineInterface';
import type { InvoiceInterface } from '@/_legacy/interfaces/InvoiceInterface';
import type { FolioFilters } from '@/_legacy/interfaces/FolioFilters';
import type {
  FolioMessageInterface,
  MessageInterface,
} from '@/_legacy/interfaces/FolioMessageInterface';

import type { CheckinPartnerInterface } from '@/_legacy/interfaces/CheckinPartnerInterface';
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
