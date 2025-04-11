import { type InvoiceLineInterface } from './InvoiceLineInterface';

export interface InvoiceInterface {
  id: number | null;
  amount: number | null;
  date: string | null;
  name: string | null;
  state: string | null;
  partnerName: string | null;
  partnerId: number | null;
  moveLines: InvoiceLineInterface[];
  folioId: number | null;
  portalUrl: string;
  moveType: string;
  isReversed: boolean;
  isDownPaymentInvoice: boolean;
  isSimplifiedInvoice: boolean;
  ref: string;
  narration: string;
  paymentState?: string;
}
