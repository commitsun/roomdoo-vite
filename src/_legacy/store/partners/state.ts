import type { PartnerStateInterface } from '.';

function state(): PartnerStateInterface {
  return {
    partners: [],
    totalPartners: 0,
    currentPartner: null,
    currentPartnerTransactions: [],
    currentPartnerInvoices: [],
  };
}

export default state;
