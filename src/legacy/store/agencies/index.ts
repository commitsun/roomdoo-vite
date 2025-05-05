import type { Module } from 'vuex';
import type { AgencyInterface } from '@/legacy/interfaces/AgencyInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface AgenciesStateInterface {
  agencies: AgencyInterface[];
}

const agenciesModule: Module<AgenciesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default agenciesModule;
