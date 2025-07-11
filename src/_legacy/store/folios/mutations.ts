import type { FolioFilters } from '@/_legacy/interfaces/FolioFilters';
import type { FolioInterface } from '@/_legacy/interfaces/FolioInterface';
import type { MessageInterface } from '@/_legacy/interfaces/FolioMessageInterface';
import type { FolioSaleLineInterface } from '@/_legacy/interfaces/FolioSaleLineInterface';
import type { InvoiceInterface } from '@/_legacy/interfaces/InvoiceInterface';
import type { TransactionInterface } from '@/_legacy/interfaces/TransactionInterface';

import type { MutationTree } from 'vuex';
import type { CheckinPartnerInterface } from '@/_legacy/interfaces/CheckinPartnerInterface';
import type { FoliosStateInterface } from '.';

const mutation: MutationTree<FoliosStateInterface> = {
  SET_CURRENT_FOLIO(state: FoliosStateInterface, folio: FolioInterface) {
    state.currentFolio = folio;
  },

  SET_FOLIOS(state: FoliosStateInterface, folios: FolioInterface[]) {
    state.folios = folios;
  },
  SET_FOLIOS_PLANNING(state: FoliosStateInterface, folios: FolioInterface[]) {
    state.foliosPlanning = folios;
  },
  SET_FOLIO_TRANSACTIONS(state: FoliosStateInterface, transactions: TransactionInterface[]) {
    state.transactions = transactions;
  },

  SET_FOLIO_SALE_LINES(state: FoliosStateInterface, saleLines: FolioSaleLineInterface[]) {
    state.saleLines = saleLines;
  },

  SET_FOLIO_INVOICES(state: FoliosStateInterface, invoices: InvoiceInterface[]) {
    state.invoices = invoices;
  },
  SET_FOLIO_FILTERS(state: FoliosStateInterface, filters: FolioFilters) {
    state.lastFolioFilters = filters;
  },

  SET_FOLIO_MESSAGES(state: FoliosStateInterface, messages: MessageInterface) {
    state.messages = messages;
  },
  SET_ADULTS_IN_FOLIO(state: FoliosStateInterface, adults: CheckinPartnerInterface[]) {
    state.adultsInFolio = adults;
  },
};

export default mutation;
