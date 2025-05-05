import type { Module } from 'vuex';
import type { TransactionMethodInterface } from '@/legacy/interfaces/TransactionMethodInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface AccountJournalsStateInterface {
  accountJournals: TransactionMethodInterface[];
}

const accountJournalsModule: Module<AccountJournalsStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default accountJournalsModule;
