import type { InvoiceInterface } from '@/legacy/interfaces/InvoiceInterface';
import type { PartnerInterface } from '@/legacy/interfaces/PartnerInterface';
import type { TransactionInterface } from '@/legacy/interfaces/TransactionInterface';
import type { MutationTree } from 'vuex';
import type { PartnerStateInterface } from '.';

const mutation: MutationTree<PartnerStateInterface> = {
  REMOVE_PARTNER(state: PartnerStateInterface) {
    state.currentPartner = null;
  },
  REMOVE_PARTNERS(state: PartnerStateInterface) {
    state.partners = [];
    state.totalPartners = 0;
  },

  SET_PARTNERS(state: PartnerStateInterface, partners: PartnerInterface[]) {
    partners.forEach((partner) => {
      if (partner.birthdate) {
        partner.birthdate = new Date(partner.birthdate);
        if (!Number(partner.birthdate)) {
          partner.birthdate = null;
        }
      }
      if (partner.documentExpeditionDate) {
        partner.documentExpeditionDate = new Date(partner.documentExpeditionDate);
        if (!Number(partner.documentExpeditionDate)) {
          partner.documentExpeditionDate = null;
        }
      }
    });
    state.partners = partners;
  },

  PUSH_PARTNERS(state: PartnerStateInterface, partners: PartnerInterface[]) {
    state.partners.push(...partners);
  },
  SET_TOTAL_PARTNERS(state: PartnerStateInterface, total: number) {
    state.totalPartners = total;
  },
  SET_CURRENT_PARTNER(state: PartnerStateInterface, partner: PartnerInterface) {
    state.currentPartner = partner;
  },
  CLEAR_CURRENT_PARTNER(state: PartnerStateInterface) {
    state.currentPartner = null;
  },
  SET_CURRENT_PARTNER_TRANSACTIONS(
    state: PartnerStateInterface,
    transactions: TransactionInterface[]
  ) {
    state.currentPartnerTransactions = transactions;
  },
  SET_CURRENT_PARTNER_INVOICES(state: PartnerStateInterface, invoices: InvoiceInterface[]) {
    state.currentPartnerInvoices = invoices;
  },
};

export default mutation;
