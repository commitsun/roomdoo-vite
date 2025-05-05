import { type InvoiceInterface } from './InvoiceInterface';

export interface InvoiceResultInterface {
  invoices: InvoiceInterface[];
  total: number;
  totalInvoices: number;
}
