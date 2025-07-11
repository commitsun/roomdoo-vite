import { type TransactionInterface } from './TransactionInterface';

export interface TransactionResultInterface {
  transactions: TransactionInterface[];
  total: number;
  totalTransactions: number;
}
