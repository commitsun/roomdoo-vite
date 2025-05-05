import type { FolioSaleLineInterface } from './FolioSaleLineInterface';

export interface PartnerSaleLines {
  defaultInvoiceTo: number | null;
  partnerName: string;
  partnerSaleLines: FolioSaleLineInterface[];
  pendingToPay: number;
}
