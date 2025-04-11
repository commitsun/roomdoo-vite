import { type FolioSaleLineInterface } from './FolioSaleLineInterface';
import { type InvoiceLineInterface } from './InvoiceLineInterface';

export interface PayloadAccountMoveInterface {
  date: string;
  partnerId: number;
  saleLines: FolioSaleLineInterface[];
  narration: string;
  folioId: number;
}

export interface PayloadInvoiceInterface {
  date: string;
  partnerId: number;
  moveLines: InvoiceLineInterface[];
  narration: string;
  invoiceId: number;
  state: string;
}

export interface PayloadMailFolioInterface {
  folioId: number;
  mailType: string;
  subject: string;
  bodyMail: string;
  partnerIds: number[];
  emailAddresses: string[];
  language?: string;
}

export interface PayloadMailInvoiceInterface {
  invoiceId: number;
  subject: string;
  bodyMail: string;
  partnerIds: number[];
  emailAddresses: string[];
  language?: string;
}
