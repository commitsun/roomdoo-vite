import type { InvoiceInterface } from '@/legacy/interfaces/InvoiceInterface';
import type { MutationTree } from 'vuex';
import type { InvoicesStateInterface } from '.';

const mutation: MutationTree<InvoicesStateInterface> = {
  SET_INVOICES(state: InvoicesStateInterface, invoices: InvoiceInterface[]) {
    state.invoices = invoices;
  },
  PUSH_INVOICES(state: InvoicesStateInterface, invoices: InvoiceInterface[]) {
    state.invoices.push(...invoices);
  },

  SET_TOTAL_AMOUNT(state: InvoicesStateInterface, total: number) {
    state.total = total;
  },
  ADD_TOTAL_AMOUNT(state: InvoicesStateInterface, total: number) {
    state.total += total;
  },
  SET_TOTAL_INVOICES(state: InvoicesStateInterface, totalInvoices: number) {
    state.totalInvoices = totalInvoices;
  },
  CLEAR_INVOICES(state: InvoicesStateInterface) {
    state.invoices = [];
  },
};

export default mutation;
