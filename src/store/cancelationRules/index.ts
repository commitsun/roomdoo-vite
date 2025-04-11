import type { Module } from 'vuex';
import type { CancelationRuleInterface } from '@/interfaces/CancelationRuleInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface CancelationRulesStateInterface {
  cancelationRules: CancelationRuleInterface[];
}

const cancelationRulesModule: Module<CancelationRulesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default cancelationRulesModule;
