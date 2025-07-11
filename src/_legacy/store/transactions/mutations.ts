import type { TransactionInterface } from '@/_legacy/interfaces/TransactionInterface';
import type { MutationTree } from 'vuex';
import type { TransactionsStateInterface } from '.';

const mutation: MutationTree<TransactionsStateInterface> = {
  SET_TRANSACTIONS(state: TransactionsStateInterface, transactions: TransactionInterface[]) {
    state.transactions = transactions;
  },
  PUSH_TRANSACTIONS(state: TransactionsStateInterface, transactions: TransactionInterface[]) {
    state.transactions.push(...transactions);
  },
  SET_TOTAL_AMOUNT(state: TransactionsStateInterface, total: number) {
    state.total = total;
  },
  SET_TOTAL_TRANSACTIONS(state: TransactionsStateInterface, totalTransactions: number) {
    state.totalTransactions = totalTransactions;
  },

  SET_CURRENT_TRANSACTION(state: TransactionsStateInterface, transaction: TransactionInterface) {
    state.currentTransaction = transaction;
  },
  REMOVE_CURRENT_TRANSACTION(state: TransactionsStateInterface) {
    state.currentTransaction = null;
  },
  REMOVE_TRANSACTIONS(state: TransactionsStateInterface) {
    state.transactions = [];
  },
};

export default mutation;
