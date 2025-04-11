export interface TransactionInterface {
  id: number;
  name: string;
  amount: number;
  journalId: number;
  destinationJournalId: number;
  date: string;
  partnerName: string;
  folioId: number;
  partnerId: number;
  transactionType: string;
  reference: string;
  createUid: number;
  pmsPropertyId: number;
  isReconcilied: boolean;
  downPaymentInvoiceId: number | null;
}
