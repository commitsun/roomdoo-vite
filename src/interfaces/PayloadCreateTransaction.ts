// remove?
export interface PayloadCreateTransaction {
  journalId: number;
  destinationJournalId?: number;
  date: string;
  pmsPropertyId: number;
  amount: number;
  transactionType: string;
  reference: string;
  partnerId?: number;
}
