import type { TransactionInterface } from './TransactionInterface';

export interface PartnerTransactions {
  partnerId: number;
  partnerName: string;
  partnerCharges: TransactionInterface[];
  partnerRefunds: TransactionInterface[];
  chargesAmountTotal: number;
  refundsAmountTotal: number;
}
