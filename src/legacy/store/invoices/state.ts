import type { InvoicesStateInterface } from '.';

function state(): InvoicesStateInterface {
  return {
    invoices: [],
    total: 0,
    totalInvoices: 0,
  };
}

export default state;
