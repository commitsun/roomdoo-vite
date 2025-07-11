import type { Module } from 'vuex';
import type { TransactionInterface } from '@/_legacy/interfaces/TransactionInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface TransactionsStateInterface {
  transactions: TransactionInterface[];
  total: number;
  totalTransactions: number;
  currentTransaction: TransactionInterface | null;
}

const transactionsModule: Module<TransactionsStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default transactionsModule;
