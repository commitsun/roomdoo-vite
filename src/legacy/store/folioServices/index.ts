import type { Module } from 'vuex';
import type { ServiceInterface } from '@/legacy/interfaces/ServiceInterface';
import type { StateInterface } from '../index';
import state from './state';
import actions from './actions';
import mutations from './mutations';

export interface FolioServicesStateInterface {
  folioServices: ServiceInterface[];
}

const folioServicesModule: Module<FolioServicesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state,
};

export default folioServicesModule;
