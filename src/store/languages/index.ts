import type { Module } from 'vuex';
import type { LanguageInterface } from '@/interfaces/LanguageInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface LanguageStateInterface {
  languages: LanguageInterface[];
}

const languagesModule: Module<LanguageStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default languagesModule;
